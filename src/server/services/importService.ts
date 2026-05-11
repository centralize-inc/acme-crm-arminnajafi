import type { Prisma, PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import Papa from 'papaparse';
import { parseRow } from '~/lib/csv/parseRow';

export class ImportService {
  constructor(private readonly db: PrismaClient) {}

  async getById(organizationId: string, id: string) {
    return this.db.import.findFirst({
      where: { id, organizationId },
    });
  }

  async list(organizationId: string) {
    return this.db.import.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Run the full import pipeline for a queued import.
   *
   * Reads the uploaded CSV, validates each row, persists valid contacts and
   * row-level errors, marks the import complete.
   */
  async processImport(importId: string): Promise<void> {
    const importRecord = await this.db.import.findUniqueOrThrow({
      where: { id: importId },
    });

    await this.db.import.update({
      where: { id: importId },
      data: { status: 'PROCESSING' },
    });

    const fileContent = await fs.readFile(importRecord.filePath, 'utf8');
    const parsed = Papa.parse<string[]>(fileContent, { skipEmptyLines: true });

    const headerRow = parsed.data[0] ?? [];
    const dataRows = parsed.data.slice(1);

    await this.db.import.update({
      where: { id: importId },
      data: { totalRows: dataRows.length },
    });

    const validContacts: Prisma.ContactCreateManyInput[] = [];
    const rowErrors: Prisma.ImportErrorCreateManyInput[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i] ?? [];
      const result = parseRow(headerRow, row);
      if (result.ok) {
        validContacts.push({
          organizationId: importRecord.organizationId,
          email: result.contact.email,
          firstName: result.contact.firstName,
          lastName: result.contact.lastName,
          company: result.contact.company,
        });
      } else {
        rowErrors.push({
          importId,
          rowNumber: i + 2,
          rowData: row,
          errorMessage: result.error,
        });
      }
    }

    await this.db.contact.createMany({
      data: validContacts,
      skipDuplicates: true,
    });

    if (rowErrors.length > 0) {
      await this.db.importError.createMany({ data: rowErrors });
    }

    await this.db.import.update({
      where: { id: importId },
      data: {
        status: 'COMPLETED',
        processedRows: validContacts.length,
        successfulRows: validContacts.length,
        failedRows: rowErrors.length,
        completedAt: new Date(),
      },
    });
  }
}
