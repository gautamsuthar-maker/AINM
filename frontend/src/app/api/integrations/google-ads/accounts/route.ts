import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/google-ads/client';

export async function GET() {
  try {
    const customer = getCustomer();

    const rows = await customer.query(`
      SELECT
        customer_client.id,
        customer_client.descriptive_name,
        customer_client.currency_code,
        customer_client.time_zone,
        customer_client.manager
      FROM customer_client
      WHERE customer_client.status = 'ENABLED'
      ORDER BY customer_client.descriptive_name ASC
    `);

    const accounts = rows.map((row: Record<string, any>) => ({
      customerId: String(row.customer_client?.id ?? ''),
      descriptiveName: String(row.customer_client?.descriptive_name ?? ''),
      currencyCode: String(row.customer_client?.currency_code ?? ''),
      timeZone: String(row.customer_client?.time_zone ?? ''),
      manager: Boolean(row.customer_client?.manager),
    }));

    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Failed to list accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list accounts' },
      { status: error.message?.includes('Not connected') ? 401 : 500 }
    );
  }
}
