import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Code from "@tiptap/extension-code";
import Mention from "@tiptap/extension-mention";
import clsx from "clsx";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Image,
  Smile,
  Link2,
  AtSign,
  Code2,
} from "lucide-react";

export default function CommentEditor({ onSubmit }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write something …" }),
      ImageExtension,
      Link.configure({ openOnClick: false }),
      Code,
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          char: "@",
          items: ({ query }) => {
            const allUsers = [
              { id: 1, label: "nika" },
              { id: 2, label: "alex" },
              { id: 3, label: "dev-team" },
            ];
            return allUsers
              .filter(user => user.label.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5);
          },
          render: () => {
            let component;
            let popup;

            return {
              onStart: props => {
                component = document.createElement("div");
                component.className = "mention-suggestion";
                props.items.forEach(item => {
                  const el = document.createElement("div");
                  el.className = "mention-item";
                  el.textContent = item.label;
                  el.onclick = () => props.command(item);
                  component.appendChild(el);
                });
                popup = component;
                document.body.appendChild(popup);
              },
              onExit: () => {
                if (popup) document.body.removeChild(popup);
              },
              onUpdate: props => {
                while (popup.firstChild) popup.removeChild(popup.firstChild);
                props.items.forEach(item => {
                  const el = document.createElement("div");
                  el.className = "mention-item";
                  el.textContent = item.label;
                  el.onclick = () => props.command(item);
                  popup.appendChild(el);
                });
              },
            };
          },
        },
      }),
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

  const insertImage = () => {
    const url = prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const insertLink = () => {
    const url = prompt("Enter link URL");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertEmoji = emoji => {
    editor.chain().focus().insertContent(emoji.native).run();
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

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

        <ToolbarButton icon={<Image size={16} />} onClick={insertImage} />
        <ToolbarButton icon={<Link2 size={16} />} onClick={insertLink} />
        <ToolbarButton icon={<Code2 size={16} />} command="toggleCode" editor={editor} />

        <ToolbarButton icon={<AtSign size={16} />} command="toggleMention" editor={editor} />
        <ToolbarButton
          icon={<Smile size={16} />}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />

        {showEmojiPicker && (
          <div className="emoji-picker-popover" ref={emojiPickerRef}>
            <Picker data={data} onEmojiSelect={insertEmoji} />
          </div>
        )}
      </div>

      <div className="comments-editor">
        <EditorContent editor={editor} />
      </div>

      <div className="save-comment-button">
        <button onClick={handleSubmit}>Send</button>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, command, editor, onClick }) {
  const handleClick = () => {
    if (onClick) return onClick();

    const chained = editor.chain().focus();

    if (typeof chained[command] === "function") {
      chained[command]().run();
    } else {
      console.warn(`Unknown chain command: ${command}`);
    }
  };

  return (
    <button onClick={handleClick} type="button" className={clsx("button-click")}>
      {icon}
    </button>
  );
}
