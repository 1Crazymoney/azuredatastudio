/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as DOM from 'vs/base/browser/dom';
import { Component, OnInit, Input, ViewChild, TemplateRef, ElementRef, Inject, Output, EventEmitter, ChangeDetectorRef, forwardRef } from '@angular/core';
import { ICellModel } from 'sql/workbench/services/notebook/browser/models/modelInterfaces';
import { NotebookModel } from 'sql/workbench/services/notebook/browser/models/notebookModel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { HideCellAction, RunCellAction, ViewCellToggleMoreActions } from 'sql/workbench/contrib/notebook/browser/notebookViews/actions';
import { NotebookViewExtension, INotebookViewCellMetadata, INotebookView, CellChangeEventType } from 'sql/workbench/services/notebook/browser/models/notebookView';
import { CellContext } from 'sql/workbench/contrib/notebook/browser/cellViews/codeActions';
import { CellTypes } from 'sql/workbench/services/notebook/common/contracts';
import { IColorTheme, ICssStyleCollector, registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { ITaskbarContent, Taskbar } from 'sql/base/browser/ui/taskbar/taskbar';


//declare var $: any; // JQuery

@Component({
	selector: 'gridstack-item',
	templateUrl: decodeURI(require.toUrl('./gridstackItem.component.html'))
})
export class GridStackItemComponent implements OnInit {
	private _actionbar: Taskbar;
	private _metadata: INotebookViewCellMetadata;
	private _activeView: INotebookView;

	public _cellToggleMoreActions: ViewCellToggleMoreActions;

	@Input() cell: ICellModel;
	@Input() model: NotebookModel;
	@Input() extension: NotebookViewExtension;
	@Input() ready: boolean;
	@Output() onChange: EventEmitter<any> = new EventEmitter();

	@ViewChild('templateRef') templateRef: TemplateRef<any>;
	@ViewChild('item', { read: ElementRef }) private _item: ElementRef;
	@ViewChild('actionbar', { read: ElementRef }) private _actionbarRef: ElementRef;

	constructor(
		@Inject(forwardRef(() => ChangeDetectorRef)) private _changeRef: ChangeDetectorRef,
		@Inject(IInstantiationService) private _instantiationService: IInstantiationService,
	) { }

	ngOnInit() {
		this.initActionBar();
	}

	ngOnChanges() {
		if (this.extension) {
			this._activeView = this.extension.getActiveView();
			this._metadata = this.extension.getCellMetadata(this.cell);
		}
	}

	ngAfterContentInit() {
		if (this.extension) {
			this._activeView = this.extension.getActiveView();
			this._metadata = this.extension.getCellMetadata(this.cell);
		}
	}

	ngAfterViewInit() {
		this.initActionBar();
		this.detectChanges();
	}

	initActionBar() {
		if (this._actionbarRef) {
			let taskbarContent: ITaskbarContent[] = [];
			let context = new CellContext(this.model, this.cell);

			this._actionbar = new Taskbar(this._actionbarRef.nativeElement);
			this._actionbar.context = { target: this._actionbarRef.nativeElement };

			if (this.cell.cellType === CellTypes.Code) {
				let runCellAction = this._instantiationService.createInstance(RunCellAction, context);
				taskbarContent.push({ action: runCellAction });
			}

			let hideButton = new HideCellAction(this.hide, this);
			taskbarContent.push({ action: hideButton });

			let moreActionsContainer = DOM.$('li.action-item');
			this._cellToggleMoreActions = this._instantiationService.createInstance(ViewCellToggleMoreActions);
			this._cellToggleMoreActions.onInit(moreActionsContainer, context);
			taskbarContent.push({ element: moreActionsContainer });

			this._actionbar.setContent(taskbarContent);

		}
	}

	get elementRef(): ElementRef {
		return this._item;
	}

	changed(event: CellChangeEventType) {
		this.onChange.emit({ cell: this.cell, event: event });
	}

	detectChanges() {
		this._changeRef.detectChanges();
	}

	public selectCell(cell: ICellModel, event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		if (!this.model.activeCell || this.model.activeCell.id !== cell.id) {
			this.model.updateActiveCell(cell);
			this.changed('active');
		}
	}

	public hide(): void {
		this.changed('hide');
	}

	public get data(): any {
		return this._metadata?.views?.find(v => v.guid === this._activeView.guid);
	}

	public get width(): number {
		return this.data?.width ? this.data.width : 12;
	}

	public get height(): number {
		return this.data.height ? this.data.height : 4;
	}

	public get x(): number {
		return this.data?.x;
	}

	public get y(): number {
		return this.data?.y;
	}

	public get display(): boolean {
		if (!this._metadata || !this._activeView) {
			return true;
		}

		return !this.data?.hidden;
	}

	public get showActionBar(): boolean {
		return this.cell.active;
	}
}

registerThemingParticipant((theme: IColorTheme, collector: ICssStyleCollector) => {
	collector.addRule(`
		.notebook-button.toolbarIconStop {
			background-color: white;
			margin: 0 2px;
			background-size: 20px 25px;
			height: 24px;
			width: 29px;
			background-repeat: no-repeat;
		}
	`);
});
