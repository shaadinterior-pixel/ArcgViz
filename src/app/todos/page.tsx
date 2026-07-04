import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = await createClient()

  const { data: todos, error } = await supabase.from('todos').select()

  return (
    <div className="p-8 mt-24">
      <h1 className="text-2xl font-bold mb-4">Todos List (Supabase SSR Test)</h1>
      {error && <p className="text-red-500">Error: {error.message}</p>}
      <ul className="list-disc pl-5">
        {todos?.map((todo: any) => (
          <li key={todo.id} className="mb-2">{todo.name || todo.title}</li>
        ))}
        {(!todos || todos.length === 0) && !error && <li>No todos found or table missing.</li>}
      </ul>
    </div>
  )
}
