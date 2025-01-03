import { Plugin } from 'obsidian';


export default class LinkOpeningRestore extends Plugin {
	static #g_SELECTOR = '.cm-content';

	#registeredElements = new Set<Element>();


	override onload() {
		// console.log('debug', this.#registeredElements);
		this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
			this.#addListeners();

			// 释放资源
			this.#registeredElements.forEach(v => {
				if (!document.contains(v)) {
					// console.log('[active-leaf-change] no longer active', v);
					this.#registeredElements.delete(v);
				}
			});
		}));
		this.#addListeners();
	}

	override onunload() {
		this.#removeListeners();
	}


	#clickEventHandler = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (target.tagName === 'A' && !event.ctrlKey) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	#addListeners() {
		const editors = document.querySelectorAll(LinkOpeningRestore.#g_SELECTOR);
		for (const i of Array.from(editors)) {
			if (this.#registeredElements.has(i)) {
				continue;
			}

			// console.log('[addListeners] new listener', i);
			i.addEventListener('click', this.#clickEventHandler, {
				capture: true
			});
			this.#registeredElements.add(i);
		}
	}

	#removeListeners() {
		this.#registeredElements.forEach(v => {
			v.removeEventListener('click', this.#clickEventHandler, {
				capture: true
			});
			this.#registeredElements.delete(v);
		});
	}
}
