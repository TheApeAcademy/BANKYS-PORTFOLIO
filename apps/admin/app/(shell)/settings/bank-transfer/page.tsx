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
    .select("currency, provider, beneficiary_name, details, active, updated_at")
    .order("currency")
    .order("provider");

  const byCurrency = new Map<string, typeof accounts>();
  for (const a of accounts ?? []) {
    byCurrency.set(a.currency, [...(byCurrency.get(a.currency) ?? []), a]);
  }
  const extraCurrencies = [...byCurrency.keys()].filter((c) => !SUGGESTED_CURRENCIES.includes(c));
  const currencies = [...SUGGESTED_CURRENCIES, ...extraCurrencies];

  return (
    <div>
      <PageHeader
        title="Bank transfer receiving accounts"
        description="What clients see when they choose Bank Transfer at checkout. A currency can have more than one provider (e.g. Payoneer and Skrill both receiving EUR) — clients see all active ones and pick whichever they prefer. Enter only real values the provider gives you — nothing here is invented."
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
        <div className="flex flex-col gap-5">
          {currencies.map((currency) => {
            const existingForCurrency = byCurrency.get(currency) ?? [];
            return (
              <div key={currency} className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">{currency}</p>
                {existingForCurrency.map((account) => (
                  <BankTransferAccountForm key={`${currency}-${account.provider}`} currency={currency} existing={account} />
                ))}
                <BankTransferAccountForm currency={currency} existing={null} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
