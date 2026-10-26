import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { formOptions } from "../form-options";
import { KomputerForm } from "../komputer-form";

export const metadata: Metadata = { title: "Tambah PC" };

export default async function CreateKomputerPage() {
  return (
    <PageContainer breadcrumbs={[{ title: "Data PC", href: "/admin/komputer" }, { title: "Tambah" }]}>
      <KomputerForm {...await formOptions()} />
    </PageContainer>
  );
}
