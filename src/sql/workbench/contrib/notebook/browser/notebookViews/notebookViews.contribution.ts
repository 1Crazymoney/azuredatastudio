/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Registry } from 'vs/platform/registry/common/platform';
import { localize } from 'vs/nls';
import { IConfigurationRegistry, Extensions as ConfigExtensions } from 'vs/platform/configuration/common/configurationRegistry';

export const NOTEBOOK_VIEWS_ENABLED_PROPERTY = 'notebookViews.enabled';

const properties = {};
properties[NOTEBOOK_VIEWS_ENABLED_PROPERTY] = {
	'type': 'boolean',
	'default': false,
	'description': localize('notebookViews.enabled', "(Preview) enable notebook views")
};

const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigExtensions.Configuration);

configurationRegistry.registerConfiguration({
	'id': 'notebookViews',
	'title': 'Notebook Views',
	'type': 'object',
	'properties': properties
});

