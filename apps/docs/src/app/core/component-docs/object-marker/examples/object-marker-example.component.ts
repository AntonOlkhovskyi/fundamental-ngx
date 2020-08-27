import { Component } from '@angular/core';

@Component({
    selector: 'fd-object-marker-example',
    templateUrl: './object-marker-example.component.html'
})
export class ObjectMarkerExampleComponent {}

@Component({
    selector: 'fd-object-marker-icon-text-example',
    templateUrl: './object-marker-Icon-text-example.component.html'
})
export class ObjectMarkerIconAndTextExampleComponent {}

@Component({
    selector: 'fd-object-marker-text-example',
    templateUrl: './object-marker-text-example.component.html'
})
export class ObjectMarkerTextExampleComponent {}

@Component({
    selector: 'fd-object-marker-clickable-example',
    templateUrl: './object-marker-clickable-example.component.html'
})
export class ObjectMarkerClickableExampleComponent {
    glyph = 'private';
    changeGlyph(): void {
        this.glyph = 'add-favorite';
    }
}
