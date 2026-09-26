import { CollectionTools } from "../components/CollectionTools";
import { ErrorState, LoadingState, PageHeader, Button } from "../components/ui";
import { getAuditEntries } from "../lib/operations";
import { formatDate } from "../lib/format";
import { useAsync } from "../lib/useAsync";

export function AuditPage() {
  const state = useAsync(getAuditEntries);
  return (
    <>
      <PageHeader
        title="Audit log"
        description="Последние 500 административных действий. Содержание и секреты не записываются."
        action={
          <Button disabled={state.loading} onClick={() => void state.reload()}>
            Обновить
          </Button>
        }
      />
      {state.loading && <LoadingState />}
      {state.error && <ErrorState message={state.error} retry={state.reload} />}
      {state.data && (
        <CollectionTools
          rows={state.data}
          text={(e) => `${e.actor} ${e.action} ${e.entity} ${e.entity_id}`}
        >
          {(entries) => (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Когда</th>
                    <th>Администратор</th>
                    <th>Действие</th>
                    <th>Объект</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id}>
                      <td>{formatDate(e.created_at)}</td>
                      <td>{e.actor}</td>
                      <td>{e.action}</td>
                      <td>{e.entity}</td>
                      <td className="mono">{e.entity_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CollectionTools>
      )}
    </>
  );
}
