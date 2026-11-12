import { loadMvcProjectFiles } from '@/lib/mvc-files';
import ProjectWorkspace from '@/components/ProjectWorkspace';

export default function HomePage() {
  const { files, readmeContent } = loadMvcProjectFiles();

  return <ProjectWorkspace files={files} readmeContent={readmeContent} />;
}
