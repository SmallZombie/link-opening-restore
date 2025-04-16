import { Plugin, WorkspaceLeaf } from 'obsidian';


export default class LinkOpeningRestore extends Plugin {
	#registeredLeafs = new Set<WorkspaceLeaf>();

	override onload() {
		this.app.workspace.on('file-open', () => {
			this.#recheckAllLeafs();
		});
		this.#recheckAllLeafs();
	}

	override onunload() {
		this.#registeredLeafs.forEach(v => {
			const editorEl = v.view.containerEl.querySelector('.cm-content')!;
			this.#removeListenerFromElement(editorEl);
		});
	}


	#recheckAllLeafs() {
		this.app.workspace.iterateAllLeaves(leaf => {
			if (leaf.view.getViewType() === 'markdown' && !this.#registeredLeafs.has(leaf)) {
				// console.log('debug new leaf', leaf);
				this.#registeredLeafs.add(leaf);
				const editorEl = leaf.view.containerEl.querySelector('.cm-content');
				// 在某些情况下，这里会是 null。 ——我没能在我的环境中复现这个问题，先这样解决吧
				if (!editorEl) return;

				this.#addListenerToElement(editorEl);

				const originalUnload = leaf.view.onunload;
				leaf.view.onunload = () => {
					// console.log('debug unload leaf', leaf);
					this.#registeredLeafs.delete(leaf);
					this.#removeListenerFromElement(editorEl);
					originalUnload();
					leaf.view.onunload = originalUnload;
				}
			}
		});
	}

	#clickEventHandler(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.tagName === 'A' && !event.ctrlKey) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	#addListenerToElement(element: Element) {
		element.addEventListener('click', this.#clickEventHandler, {
			capture: true
		});
	}

	#removeListenerFromElement(element: Element) {
		element.removeEventListener('click', this.#clickEventHandler, {
			capture: true
		});
	}
}
