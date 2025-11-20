import { loadTools } from '@/lib/data';
import HomePage from '@/components/HomePage';

export default async function Page() {
  const tools = await loadTools();

  return <HomePage tools={tools} />;
}
