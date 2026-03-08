import { MarkdownView, Plugin } from 'obsidian';

export default class LinkOpeningRestore extends Plugin {
	onload() {
		document.addEventListener('click', this.#clickHandler, true);
		document.addEventListener('mousedown', this.#mousedownHandler, true);
	}

	onunload() {
		document.removeEventListener('click', this.#clickHandler, true);
		document.removeEventListener('mousedown', this.#mousedownHandler, true);
	}

	#clickHandler = (event: MouseEvent) => {
		const isCtrlPressed = event.ctrlKey || event.metaKey;
		const isShiftPressed = event.shiftKey;
		const isAltPressed = event.altKey;

		// console.log('#clickHandler', event.target, isCtrlPressed, isShiftPressed, isAltPressed);

		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if (!editor) return;

		// Only handle links
		if (!this.#isAnyLink(event.target as HTMLElement)) return;

		const token = editor.getClickableTokenAt(
			editor.posAtCoords(event.clientX, event.clientY)!
		);
		if (!token) return;

		event.stopPropagation();

		const linkText = token.text;
		if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:.+/.test(linkText)) {
			if (isCtrlPressed) window.open(linkText, '_blank');
		} else {
			if (isCtrlPressed && isShiftPressed && isAltPressed) {
				// Open in new window
				this.app.workspace.setActiveLeaf(this.app.workspace.openPopoutLeaf());
				this.app.workspace.openLinkText(linkText, '/');
			} else if (isCtrlPressed && isShiftPressed) {
				// Open in new tab
				this.app.workspace.openLinkText(linkText, '/', true);
			} else if (isCtrlPressed) {
				// Open in current tab
				this.app.workspace.openLinkText(linkText, '/');
			}
		}
	}

	#mousedownHandler = (event: MouseEvent) => {
		if (!this.#isAnyLink(event.target as HTMLElement)) return;
		// console.log('#mousedownHandler', event);

		(event.target as HTMLElement).draggable = false;
	}

	#isAnyLink(element: HTMLElement) {
		return element.closest('.cm-link') || element.closest('.cm-url') || element.closest('.cm-hmd-internal-link');
	}
}

declare module 'obsidian' {
	interface Editor {
		posAtCoords(x: number, y: number): EditorPosition | null;
		getClickableTokenAt(pos: EditorPosition): { text: string } | null;
	}
}
