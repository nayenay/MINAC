import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactForm from "@/components/forms/ContactForm";

export default function Contacto() {
  return (
    <section id="contacto" className="py-20 md:py-28">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Contacto"
          title="Hablemos"
          subtitle="Instituciones educativas, empresas mineras, inversionistas o medios: cuéntanos qué te interesa de MINAC."
        />

        <Card className="p-6 md:p-10">
          <ContactForm />
        </Card>
      </Container>
    </section>
  );
}
