import { Plugin, WorkspaceLeaf } from "obsidian";

export default class LinkOpeningRestore extends Plugin {
	#registeredLeafs = new Set<WorkspaceLeaf>();
	#isMac = navigator.platform.toUpperCase().includes("MAC"); // Detect macOS platform

	override onload() {
		this.app.workspace.on("file-open", () => {
			this.#recheckAllLeafs();
		});
		this.#recheckAllLeafs();
	}

	override onunload() {
		this.#registeredLeafs.forEach((v) => {
			const editorEl = v.view.containerEl.querySelector(".cm-content")!;
			this.#removeListenerFromElement(editorEl);
		});
	}

	#recheckAllLeafs() {
		this.app.workspace.iterateAllLeaves((leaf) => {
			if (
				leaf.view.getViewType() === "markdown" &&
				!this.#registeredLeafs.has(leaf)
			) {
				// console.log('[debug] #recheckAllLeafs new leaf', leaf);
				this.#registeredLeafs.add(leaf);
				const editorEl =
					leaf.view.containerEl.querySelector(".cm-content");
				// In some cases, this will be null.
				// —— I couldn't reproduce this issue in my environment, Let's leave it at that for now.
				if (!editorEl) return;

				this.#addListenerToElement(editorEl);

				const originalUnload = leaf.view.onunload;
				leaf.view.onunload = () => {
					// console.log('debug unload leaf', leaf);
					this.#registeredLeafs.delete(leaf);
					this.#removeListenerFromElement(editorEl);
					originalUnload();
					leaf.view.onunload = originalUnload;
				};
			}
		});
	}

	#clickEventHandler = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		// console.log('[debug] #clickEventHandler target', target);
		if (
			target.tagName !== "A" &&
			!target.classList.contains("cm-hmd-internal-link") &&
			!target.classList.contains("cm-link") &&
			!target.classList.contains("cm-url")
		) {
			return;
		}

		// Handle macOS (Command key) and other platforms (Ctrl key)
		const modifierKeyPressed = this.#isMac ? event.metaKey : event.ctrlKey;

		// Shift + Modifier: Open in new window
		if (event.shiftKey && modifierKeyPressed) {
			// console.log('[debug] #clickEventHandler open in new window', decodeURIComponent(target.textContent!));
			// I'm not sure if this is the best practice.
			this.app.workspace
				.openPopoutLeaf()
				.openFile(
					this.app.metadataCache.getFirstLinkpathDest(
						decodeURIComponent(target.textContent!),
						""
					)!
				);
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		// If modifier key not pressed, prevent default link behavior
		if (!modifierKeyPressed) {
			event.preventDefault();
			event.stopPropagation();
		}
	};

	#addListenerToElement(element: Element) {
		element.addEventListener("click", this.#clickEventHandler, {
			capture: true,
		});
	}

	#removeListenerFromElement(element: Element) {
		element.removeEventListener("click", this.#clickEventHandler, {
			capture: true,
		});
	}
}
