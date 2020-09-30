import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    HostBinding,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    QueryList,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { BaseComponent } from '../base';
import { BACKGROUND_TYPE, CLASS_NAME, RESPONSIVE_SIZE } from './constants';
import { DynamicPageContentComponent } from './dynamic-page-content/dynamic-page-content.component';
import { DynamicPageTabbedContentComponent } from './dynamic-page-content/dynamic-page-tabbed-content.component';
import { DynamicPageHeaderComponent } from './dynamic-page-header/header/dynamic-page-header.component';
import { DynamicPageTitleComponent } from './dynamic-page-header/title/dynamic-page-title.component';
import { DynamicPageConfig } from './dynamic-page.config';
import { DynamicPageService } from './dynamic-page.service';
import { addClassNameToElement } from './utils';

let dynamicPageId = 0;
@Component({
    selector: 'fdp-dynamic-page',
    templateUrl: './dynamic-page.component.html',
    styleUrls: ['./dynamic-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [DynamicPageService]
})
export class DynamicPageComponent extends BaseComponent implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {
    /** Dynamic Page ID with default value  */
    @Input()
    @HostBinding('attr.id')
    id = 'fdp-dynamic-page-id-' + dynamicPageId++;

    /** Page role  */
    @Input()
    @HostBinding('attr.role')
    role = 'region';

    /** aria label for the page */
    @Input()
    ariaLabel: string;

    /**
     * sets background for content to List, Transparent or Solid background color.
     * Default is `solid`.
     */
    @Input()
    background: BACKGROUND_TYPE = 'solid';

    /**
     * sets size which in turn adds corresponding padding for the size type.
     * size can be `small`, `medium`, `large`, or `extra-large`.
     */
    @Input()
    size: RESPONSIVE_SIZE = 'extra-large';

    /** Reference to tab content children to add styles */
    @ViewChildren('tabContent')
    tabContent: QueryList<ElementRef<HTMLElement>>;

    /** reference to header component  */
    @ContentChild(DynamicPageHeaderComponent)
    headerComponent: DynamicPageHeaderComponent;

    /** reference to title component  */
    @ContentChild(DynamicPageTitleComponent)
    titleComponent: DynamicPageTitleComponent;

    /** reference to content component  */
    @ViewChild(DynamicPageContentComponent)
    _userContent: DynamicPageContentComponent;

    /** reference to content component  */
    @ContentChild(DynamicPageContentComponent) childcontent: DynamicPageContentComponent;

    /** reference to internal tabbed component  */
    @ViewChild(DynamicPageTabbedContentComponent) childTabContent: DynamicPageTabbedContentComponent;

    /** reference to content component to filter tabs */
    @ContentChildren(DynamicPageContentComponent, { descendants: true })
    tabbedContent: QueryList<DynamicPageContentComponent>;

    /** Reference to the CdkScrollable instance that wraps the scrollable content. */
    get scrollable(): CdkScrollable {
        return this._userContent || this.childcontent;
    }
    /**
     * track whether the header was toggled or not
     */
    toggledVal = false;

    /**
     * subscription for when toggle header is called
     */
    toggleSubscription: Subscription;

    /**
     * subscription for when content is scrolled
     */
    scrollSubscription: Subscription;

    /** @hidden */
    contentTemplate: TemplateRef<any>;

    /**
     * holds the tab content
     */
    _tabs: DynamicPageContentComponent[] = [];

    /**
     * whether tabbed content is present in this page
     */
    isTabbed = false;

    /** @hidden */
    private _subscriptions: Subscription = new Subscription();

    /** @hidden */
    constructor(
        protected _cd: ChangeDetectorRef,
        private _elementRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _dynamicPageService: DynamicPageService,
        protected _dynamicPageConfig: DynamicPageConfig,
        private scrollDispatcher: ScrollDispatcher,
        private zone: NgZone
    ) {
        super(_cd);
        this.toggleSubscription = this._dynamicPageService.$toggle.subscribe((val) => {
            this.toggledVal = val;
        });
    }

    /** @hidden */
    ngOnInit(): void {
        this._addClassNameToHostElement(CLASS_NAME.dynamicPage);
    }

    /** @hidden */
    ngAfterContentInit(): void {
        this._listenToChildrenQueryListChanges();
        if (this.background) {
            this.titleComponent.background = this.background;
            this.headerComponent.background = this.background;
            this.childcontent.background = this.background;
        }
        if (this.size) {
            this.titleComponent.size = this.size;
            this.headerComponent.size = this.size;
            this.childcontent.size = this.size;
        }
    }

    /**@hidden */
    ngAfterViewInit(): void {
        this._setTabStyles();
        this._listenToChildrenQueryListChanges();

        this._subscriptions.add(
            this.tabbedContent.changes.subscribe(() => {
                this._listenToChildrenQueryListChanges();
                this._setTabStyles();
            })
        );
        if (this.headerComponent?.collapsible) {
            this.snapOnScroll();
        }
        this._cd.detectChanges();
    }

    /**@hidden */
    ngOnDestroy(): void {
        this.scrollDispatcher.deregister(this.scrollable);
        this.toggleSubscription.unsubscribe();
        this.scrollSubscription.unsubscribe();
        this._subscriptions.unsubscribe();
    }
    /**
     * Snap the header to expand or collapse based on scrolling. Uses CDKScrollable.
     */
    snapOnScroll(): void {
        if (!this.scrollDispatcher.scrollContainers.has(this.scrollable)) {
            this.scrollDispatcher.register(this.scrollable);
            // console.log(this.scrollDispatcher.scrollContainers);
            const scrollContainers = this.scrollDispatcher.getAncestorScrollContainers(this.scrollable.getElementRef());
            // console.log(scrollContainers);
            scrollContainers.forEach((element) => {
                if (element !== this.scrollable) {
                    // console.log('deregisteerring ' + element.getElementRef().nativeElement.id);
                    this.scrollDispatcher.deregister(element);
                }
            });
            // console.log(this.scrollDispatcher.scrollContainers);
            this.scrollSubscription = this.scrollDispatcher.scrolled(10).subscribe((cdk: CdkScrollable) => {
                this.zone.run(() => {
                    // console.log('scrolled');
                    // console.log(cdk);
                    const scrollPosition = cdk.measureScrollOffset('top');
                    // console.log(scrollPosition);
                    if (scrollPosition > 20) {
                        console.log('collapsing header');
                        this._dynamicPageService.collapseHeader();
                    } else {
                        this._dynamicPageService.expandHeader();
                    }
                });
            });
        }
    }

    /**
     * toggle the visibility of the header on click of title area.
     */
    toggleCollapse(): any {
        this._dynamicPageService.toggleHeader(!this.toggledVal);
    }

    /**
     * set styles for tab labels
     */
    _setTabStyles(): void {
        const tabList = this._elementRef.nativeElement.querySelector('.fd-tabs');
        if (tabList) {
            // console.log('valid tabs eelement');
            this._addClassNameToCustomElement(tabList, CLASS_NAME.dynamicPageTabs);
            this._addClassNameToCustomElement(tabList, CLASS_NAME.dynamicPageTabsAddShadow);
            if (this.size) {
                this._setTabsSize(this.size, tabList);
            }
            if (this.background) {
                // console.log('changiing tab content bg here to ' + this.background);
                // prropagate the background attribute to the tabbed content component
                this.childTabContent.background = this.background;
            }
            if (this.headerComponent?.collapsible) {
                const pinCollapseShadowElement = this._elementRef.nativeElement.querySelector(
                    '.fd-dynamic-page__header-visibility-container'
                );
                if (pinCollapseShadowElement) {
                    this._addClassNameToCustomElement(
                        pinCollapseShadowElement,
                        CLASS_NAME.dynamicPageHeaderPinCollapseNoShadow
                    );
                }
            }
        }
    }

    /**
     *
     * @param sizeType
     * @param element
     */
    _setTabsSize(sizeType: RESPONSIVE_SIZE, element: Element): any {
        switch (sizeType) {
            case 'small':
                this._addClassNameToCustomElement(element, CLASS_NAME.dynamicPageTabsSmall);
                break;
            case 'medium':
                this._addClassNameToCustomElement(element, CLASS_NAME.dynamicPageTabsMedium);

                break;
            case 'large':
                this._addClassNameToCustomElement(element, CLASS_NAME.dynamicPageTabsLarge);
                break;
            case 'extra-large':
            default:
                this._addClassNameToCustomElement(element, CLASS_NAME.dynamicPageTabsExtraLarge);
                break;
        }
    }

    /** @hidden */
    private _listenToChildrenQueryListChanges(): void {
        this.tabbedContent.changes.pipe(startWith(this.tabbedContent)).subscribe(() => {
            this._createContent();
        });
    }

    /** @hidden */
    private _createContent(): void {
        const content = this.tabbedContent.toArray();

        // reset arrays
        this._tabs = [];
        // console.log('in content ' + content.length);
        if (content) {
            content.forEach((contentItem, index) => {
                if (!contentItem.tabLabel) {
                    this.isTabbed = false;
                } else {
                    this.isTabbed = true;
                    this._tabs.push(contentItem);
                }
            });
        }
    }

    /**@hidden */
    private _addClassNameToHostElement(className: string): void {
        addClassNameToElement(this._renderer, this._elementRef.nativeElement, className);
    }

    /**@hidden */
    private _addClassNameToCustomElement(element: Element, className: string): void {
        addClassNameToElement(this._renderer, element, className);
    }
}
