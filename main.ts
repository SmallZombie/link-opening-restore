import { Plugin } from 'obsidian';


export default class LinkOpeningRestore extends Plugin {
	static #g_SELECTOR = '.cm-content';


	async onload() {
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				this.#addListener();
			})
		);
		this.#addListener();
	}

	onunload() {
		this.#removeListener();
	}


	#clickEventHandler = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (target.tagName === 'A' && !event.ctrlKey) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	#addListener() {
		const els = document.querySelectorAll(LinkOpeningRestore.#g_SELECTOR);
		els.forEach(v => {
			v.removeEventListener('click', this.#clickEventHandler);
			v.addEventListener('click', this.#clickEventHandler, {
				capture: true
			});
		});
		document.addEventListener('click', this.#clickEventHandler);
	}

	#removeListener() {
		const els = document.querySelectorAll(LinkOpeningRestore.#g_SELECTOR);
		els.forEach(editor => {
			editor.removeEventListener('click', this.#clickEventHandler, {
				capture: true
			});
		});
	}
}
