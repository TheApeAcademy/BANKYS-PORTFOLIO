import Link from "next/link";
import { createClient } from "@zebraish/lib/supabase/server";
import { PageHeader, Card, buttonCls, buttonGhostCls } from "@/components/ui";
import { BankTransferAccountForm } from "@/components/BankTransferAccountForm";

// Suggested starter set — any currency can be added below, this just saves
// re-typing the four your Payoneer account is most likely to support.
const SUGGESTED_CURRENCIES = ["EUR", "GBP", "USD", "CAD", "NGN"];

export default async function BankTransferSettingsPage() {
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("bank_transfer_receiving_accounts")
    .select("currency, beneficiary_name, details, active, updated_at")
    .order("currency");

  const byCurrency = new Map((accounts ?? []).map((a) => [a.currency, a]));
  const extraCurrencies = [...byCurrency.keys()].filter((c) => !SUGGESTED_CURRENCIES.includes(c));
  const currencies = [...SUGGESTED_CURRENCIES, ...extraCurrencies];

  return (
    <div>
      <PageHeader
        title="Bank transfer receiving accounts"
        description="What clients see when they choose Bank Transfer at checkout. Enter only the real values Payoneer gives you for each currency — nothing here is invented."
        action={
          <div className="flex gap-1 text-sm">
            <Link href="/settings/security" className={buttonGhostCls}>
              Security
            </Link>
            <Link href="/settings/sessions" className={buttonGhostCls}>
              Sessions
            </Link>
            <Link href="/settings/bank-transfer" className={buttonCls}>
              Bank Transfer
            </Link>
          </div>
        }
      />

      <Card>
        <div className="flex flex-col gap-3">
          {currencies.map((currency) => (
            <BankTransferAccountForm key={currency} currency={currency} existing={byCurrency.get(currency) ?? null} />
          ))}
        </div>
      </Card>
    </div>
  );
}
