/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { Button, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';

// const content =
//   '<h2 style="text-align: center;">Welcome to Mantine rich text editor</h2><p><code>RichTextEditor</code> component focuses on usability and is designed to be as simple as possible to bring a familiar editing experience to regular users. <code>RichTextEditor</code> is based on <a href="https://tiptap.dev/" rel="noopener noreferrer" target="_blank">Tiptap.dev</a> and supports all of its features:</p><ul><li>General text formatting: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike-through</s> </li><li>Headings (h1-h6)</li><li>Sub and super scripts (<sup>&lt;sup /&gt;</sup> and <sub>&lt;sub /&gt;</sub> tags)</li><li>Ordered and bullet lists</li><li>Text align&nbsp;</li><li>And all <a href="https://tiptap.dev/extensions" target="_blank" rel="noopener noreferrer">other extensions</a></li></ul>';

  export function BeritaEditor({
    onEditorReady,
    showSubmit = true,
    onSubmit,
    initialContent = '',
    onUpdate,
  }: {
    onEditorReady?: (editor: any | null) => void;
    onSubmit?: (val: string) => void;
    showSubmit?: boolean;
    initialContent?: string;
    onUpdate?: (content: string) => void;
  }) {
    const [mounted, setMounted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    
    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        Link,
        Superscript,
        SubScript,
        Highlight,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ],
      content: initialContent || '<p></p>',
      onUpdate: ({ editor }) => {
        if (onUpdate) {
          onUpdate(editor.getHTML());
        }
      },
      editorProps: {
        attributes: {
          class: 'prose max-w-none',
        },
      },
      onSelectionUpdate: () => {
        if (!isReady && editor) {
          setIsReady(true);
          onEditorReady?.(editor);
        }
      },
      immediatelyRender: false
    });
  
    useEffect(() => {
      if (editor) {
        // Set initial content when component mounts
        editor.commands.setContent(initialContent || '<p></p>');
        
        // Mark as mounted and notify parent
        if (!mounted) {
          setMounted(true);
          onEditorReady?.(editor);
        }
      }
      
      return () => {
        if (editor) {
          editor.destroy();
        }
      };
    }, [editor, initialContent, mounted, onEditorReady]);
  
    if (!editor) return <div>Loading editor...</div>;


  return (
    <Stack>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={60}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
      {showSubmit && (
        <Button onClick={() => {
          if (!editor) return
          onSubmit?.(editor?.getHTML())
        }}>Submit</Button>
      )}
    </Stack>
  );
}