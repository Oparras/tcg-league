import { FeaturePlaceholder } from "@/features/shared/components/feature-placeholder";

export default function EventsPage() {
  return (
    <FeaturePlaceholder
      title="Eventos"
      phase="Fase 4"
      description="El dominio ya soporta eventos, registros y estado de cupo. La siguiente fase conecta creacion e inscripcion."
      bullets={[
        "Listado de eventos upcoming y open registration.",
        "Detalle con participantes y plazas.",
        "Alta de eventos por owner y admin.",
      ]}
    />
  );
}
