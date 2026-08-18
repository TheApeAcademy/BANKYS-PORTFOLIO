import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { formatMoney, formatDate } from "@zebraish/lib/format";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  title: { fontSize: 20, fontWeight: 700 },
  muted: { color: "#666666" },
  section: { marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#e5e5e5" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, marginTop: 6 },
  totalLabel: { fontSize: 13, fontWeight: 700 },
  totalValue: { fontSize: 13, fontWeight: 700 },
});

export type InvoicePdfData = {
  invoiceNumber: string;
  issuedAt: string;
  projectCode: string;
  clientName: string;
  lineItems: { label: string; price: number }[];
  subtotal: number;
  total: number;
  currency: string;
};

function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Zebraish</Text>
            <Text style={styles.muted}>Invoice {data.invoiceNumber}</Text>
          </View>
          <View>
            <Text>Issued {formatDate(data.issuedAt)}</Text>
            <Text style={styles.muted}>Project {data.projectCode}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.muted}>Billed to</Text>
          <Text>{data.clientName}</Text>
        </View>

        <View>
          {data.lineItems.map((line, i) => (
            <View key={i} style={styles.row}>
              <Text>{line.label}</Text>
              <Text>{formatMoney(line.price, data.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatMoney(data.total, data.currency)}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument data={data} />);
}
