import { useEditor, EditorContent } from "@tiptap/react";
import React from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Image,
  Smile,
  Link,
  AtSign,
  Wand2,
  Code2,
  Plus,
} from "lucide-react";
import clsx from "clsx";

export default function CommentEditor({ onSubmit }) {
    const editor = useEditor({
        extensions: [
          StarterKit,
          Placeholder.configure({ placeholder: 'Write something …' }),
        ],
        content: null,
      });

  const handleSubmit = () => {
    if (editor) {
      const text = editor.getHTML();
      onSubmit(text);
      editor.commands.clearContent();
    }
  };

  return (
    <div className="toolbar-comments">
      <div className="toolbar-buttons">
        <ToolbarButton icon={<Bold size={16} />} command="toggleBold" editor={editor} />
        <ToolbarButton icon={<Italic size={16} />} command="toggleItalic" editor={editor} />
        <ToolbarButton icon={<List size={16} />} command="toggleBulletList" editor={editor} />
        <ToolbarButton
          icon={<ListOrdered size={16} />}
          command="toggleOrderedList"
          editor={editor}
        />
        <ToolbarButton icon={<CheckSquare size={16} />} command="toggleTaskList" editor={editor} />
        <ToolbarButton icon={<Image size={16} />} />
        <ToolbarButton icon={<Link size={16} />} />
        <ToolbarButton icon={<AtSign size={16} />} />
        <ToolbarButton icon={<Smile size={16} />} />
        <ToolbarButton icon={<Code2 size={16} />} />
        <ToolbarButton icon={<Wand2 size={16} />} />
        <ToolbarButton icon={<Plus size={16} />} />
      </div>

      <div className="comments-editor">
  <EditorContent editor={editor} />
</div>

      <div className="save-comment-button">
        <button onClick={handleSubmit}>Сохранить</button>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, command, editor }) {
  const handleClick = () => {
    if (editor && command) {
      editor.chain().focus()[command]().run();
    }
  };

  return (
    <button onClick={handleClick} type="button" className={clsx("button-click")}>
      {icon}
    </button>
  );
}
