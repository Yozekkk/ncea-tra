import { CollectionTools } from "../components/CollectionTools";
import { Button, ErrorState, LoadingState } from "../components/ui";
import { getSupabase } from "../lib/supabase";
import { readRows } from "../lib/readRows";
import { useAsync } from "../lib/useAsync";
import { useMutation } from "../lib/useMutation";
import { formatDate } from "../lib/format";

async function getTrash() {
  const [topics, posts] = await Promise.all([
    readRows((from, to) =>
      getSupabase()
        .from("ncreate_forum_topics")
        .select("id,title,deleted_at")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
    readRows((from, to) =>
      getSupabase()
        .from("ncreate_forum_posts")
        .select("id,body,deleted_at")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
  ]);
  return [
    ...topics.map((t) => ({ ...t, kind: "ncreate_forum_topics" as const })),
    ...posts.map((p) => ({
      id: p.id,
      title: p.body,
      deleted_at: p.deleted_at,
      kind: "ncreate_forum_posts" as const,
    })),
  ];
}
export function NCreateTrash() {
  const state = useAsync(getTrash);
  const mutation = useMutation();
  return (
    <>
      {state.loading && <LoadingState />}
      {state.error && <ErrorState message={state.error} retry={state.reload} />}
      {mutation.error && <ErrorState message={mutation.error} />}
      {mutation.message && (
        <div className="success-state" role="status">
          {mutation.message}
        </div>
      )}
      {state.data && (
        <CollectionTools rows={state.data} text={(item) => `${item.title} ${item.kind} ${item.id}`}>
          {(rows) => (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Содержимое</th>
                    <th>Тип</th>
                    <th>Удалено</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.id}>
                      <td className="content-preview">{item.title}</td>
                      <td>{item.kind}</td>
                      <td>{item.deleted_at && formatDate(item.deleted_at)}</td>
                      <td>
                        <Button
                          disabled={mutation.busy}
                          onClick={() =>
                            void mutation.perform(async () => {
                              const { error } = await getSupabase()
                                .from(item.kind)
                                .update({
                                  deleted_at: null,
                                  deleted_by: null,
                                  deletion_reason: null,
                                })
                                .eq("id", item.id)
                                .select("id")
                                .single();
                              if (error) throw new Error(error.message);
                            }, state.reload)
                          }
                        >
                          Восстановить
                        </Button>
                      </td>
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
