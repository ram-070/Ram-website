import NotesWorkspace from '../NotesWorkspace';

export default function NoteDetailPage({ params }: { params: { id: string } }) {
  return <NotesWorkspace initialNoteId={params.id} />;
}
