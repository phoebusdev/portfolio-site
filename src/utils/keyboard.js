// Keyboard navigation utility

class KeyboardNavigationController {
  constructor() {
    this.enabled = true;
    this.sections = ['intro-hero', 'proven-excellence', 'strategic-vision', 'immediate-value'];
    this.currentIndex = 0;
    this.boundHandleKeyDown = this.handleKeyDown.bind(this); // Store bound reference
  }

  init() {
    document.addEventListener('keydown', this.boundHandleKeyDown);
    console.log('[Keyboard] Navigation enabled (↑↓ arrows, Home, End, Tab)');
  }

  handleKeyDown(event) {
    if (!this.enabled) return;

    // Allow default behavior for form inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'PageDown':
        event.preventDefault();
        this.navigateToNext();
        break;

      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        this.navigateToPrevious();
        break;

      case 'Home':
        event.preventDefault();
        this.navigateToSection(0);
        break;

      case 'End':
        event.preventDefault();
        this.navigateToSection(this.sections.length - 1);
        break;

      case 'Tab':
        // Let Tab work naturally for accessibility
        // Just update current section based on focused element
        setTimeout(() => this.updateCurrentSectionFromFocus(), 100);
        break;

      default:
        break;
    }
  }

  navigateToNext() {
    if (this.currentIndex < this.sections.length - 1) {
      this.navigateToSection(this.currentIndex + 1);
    }
  }

  navigateToPrevious() {
    if (this.currentIndex > 0) {
      this.navigateToSection(this.currentIndex - 1);
    }
  }

  navigateToSection(index) {
    if (index < 0 || index >= this.sections.length) return;

    this.currentIndex = index;
    const sectionId = this.sections[index];
    const section = document.querySelector(`[data-section="${sectionId}"]`);

    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Focus the section for screen readers
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });

      console.log(`[Keyboard] Navigated to: ${sectionId}`);
    }
  }

  updateCurrentSectionFromFocus() {
    const focusedElement = document.activeElement;
    const section = focusedElement.closest('[data-section]');

    if (section) {
      const sectionId = section.getAttribute('data-section');
      const index = this.sections.indexOf(sectionId);
      if (index !== -1) {
        this.currentIndex = index;
      }
    }
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }

  destroy() {
    document.removeEventListener('keydown', this.boundHandleKeyDown);
    console.log('[Keyboard] Navigation destroyed');
  }
}

// Singleton instance
const keyboardNavController = new KeyboardNavigationController();

export default keyboardNavController;
