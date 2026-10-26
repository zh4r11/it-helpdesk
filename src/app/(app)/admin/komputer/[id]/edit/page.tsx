import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { formOptions } from "../../form-options";
import { getKomputer } from "../../get-komputer";
import { KomputerForm } from "../../komputer-form";

export async function generateMetadata({ params }: PageProps<"/admin/komputer/[id]/edit">): Promise<Metadata> {
  const komputer = await getKomputer((await params).id);

  return { title: `Ubah ${komputer.namaPc}` };
}

export default async function EditKomputerPage({ params }: PageProps<"/admin/komputer/[id]/edit">) {
  const komputer = await getKomputer((await params).id);
  const options = await formOptions({
    karyawanId: komputer.karyawanId,
    komponenIds: komputer.rakitan.map((r) => r.komponenId),
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Data PC", href: "/admin/komputer" }, { title: "Ubah" }]}>
      <KomputerForm
        {...options}
        komputer={{
          id: komputer.id,
          karyawanId: komputer.karyawanId,
          namaPc: komputer.namaPc,
          cal: komputer.cal,
          ipAddress: komputer.ipAddress,
          aksesInternet: komputer.aksesInternet,
          sistemOperasi: komputer.sistemOperasi,
          office: komputer.office,
          catatan: komputer.catatan,
          rakitan: komputer.rakitan.map((r) => ({ komponenId: r.komponenId, barcode: r.barcode, jumlah: r.jumlah })),
        }}
      />
    </PageContainer>
  );
}
