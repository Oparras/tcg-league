import { FeaturePlaceholder } from "@/features/shared/components/feature-placeholder";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <FeaturePlaceholder
      title={`Detalle de evento · ${id}`}
      phase="Fase 4"
      description="Ruta preparada para reflejar ficha del evento e inscripciones reales sin mover la arquitectura."
      bullets={[
        "Descripcion, formato y capacidad.",
        "Participantes inscritos y estado del cupo.",
        "Base para brackets o standings futuros.",
      ]}
    />
  );
}
