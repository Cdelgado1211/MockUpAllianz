import AlertCard from './AlertCard';
import ValidationSummary from './ValidationSummary';
import ValidationDocumentCard from './ValidationDocumentCard';

function EmptyState({ title, description, tone = 'slate' }) {
  const toneMap = {
    slate: 'border-[#E0E6ED] bg-[#F7FAFC] text-[#434751]',
    green: 'border-[#CFE8D5] bg-[#F6FBF7] text-[#137333]',
    amber: 'border-[#F9D7A7] bg-[#FFFDF7] text-[#A15C00]'
  };

  return (
    <div className={`rounded-[14px] border border-dashed px-4 py-5 text-sm ${toneMap[tone]}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 leading-6">{description}</p>
    </div>
  );
}

function SectionCard({ eyebrow, title, description, children, tone = 'slate', maxWidth = 'max-w-[900px]' }) {
  const toneMap = {
    slate: 'border-[#E0E6ED]',
    green: 'border-[#CFE8D5]',
    amber: 'border-[#F9D7A7]',
    red: 'border-[#F6C4B8]'
  };

  return (
    <section className={`mx-auto w-full ${maxWidth} rounded-[20px] border bg-white p-5 shadow-sm sm:p-6 ${toneMap[tone]}`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#006494]">{eyebrow}</p>
        <h3 className="mt-1 text-[20px] font-semibold leading-7 text-[#181C1E]">{title}</h3>
        {description ? <p className="mt-2 text-sm leading-6 text-[#434751]">{description}</p> : null}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export default function ValidationResultsPanel({
  summary,
  correctDocuments,
  reviewDocuments,
  alerts,
  onResolveAlert,
  onEditDocument,
  onIgnoreAlert
}) {
  return (
    <div className="space-y-4">
      <ValidationSummary summary={summary} />

      {alerts.length > 0 ? (
        <SectionCard
          eyebrow="Sistema de alertas"
          title="Alertas detectadas"
          description="Revisa las diferencias encontradas. Puedes corregir datos, reemplazar documentos o continuar si la validación del trámite lo permite."
          tone="amber"
          maxWidth="max-w-[980px]"
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onResolve={() => onResolveAlert(alert)}
                onIgnore={() => onIgnoreAlert(alert.id)}
              />
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        eyebrow="Resultados de validación"
        title="Documentos correctos"
        description="Documentos que el sistema validó automáticamente sin inconsistencias."
        tone="green"
        maxWidth="max-w-[980px]"
      >
        {correctDocuments.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {correctDocuments.map((document) => (
              <ValidationDocumentCard
                key={document.id}
                document={document}
                variant="success"
              />
            ))}
          </div>
        ) : (
          <EmptyState
            tone="green"
            title="No hay documentos validados por ahora."
            description="Cuando el sistema encuentre coincidencias correctas, aparecerán aquí para que el usuario pueda revisarlas."
          />
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Observaciones"
        title="Documentos que requieren revisión"
        description="Estos documentos necesitan atención antes de continuar o aceptar las observaciones encontradas."
        tone="amber"
        maxWidth="max-w-[980px]"
      >
        {reviewDocuments.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {reviewDocuments.map((document) => (
              <ValidationDocumentCard
                key={document.id}
                document={document}
                variant={document.status === 'illegible' ? 'danger' : 'warning'}
                actionLabel="Reemplazar"
                onAction={() => onEditDocument(document)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            tone="amber"
            title="No se detectaron documentos que requieran revisión."
            description="Si luego aparece una observación, podrás corregirla desde la misma tarjeta del documento."
          />
        )}
      </SectionCard>
    </div>
  );
}
