import { useMemo } from 'react';

import { Input } from '@grafana/ui';
import { t } from 'app/core/internationalization';
import { OptionsPaneCategoryDescriptor } from 'app/features/dashboard/components/PanelEditor/OptionsPaneCategoryDescriptor';
import { OptionsPaneItemDescriptor } from 'app/features/dashboard/components/PanelEditor/OptionsPaneItemDescriptor';

import { useConditionalRenderingEditor } from '../../conditional-rendering/ConditionalRenderingEditor';
import { useLayoutCategory } from '../layouts-shared/DashboardLayoutSelector';
import { useEditPaneInputAutoFocus } from '../layouts-shared/utils';

import { TabItem } from './TabItem';

export function getEditOptions(model: TabItem): OptionsPaneCategoryDescriptor[] {
  const { layout } = model.useState();

  const tabCategory = useMemo(
    () =>
      new OptionsPaneCategoryDescriptor({ title: '', id: 'tab-item-options' }).addItem(
        new OptionsPaneItemDescriptor({
          title: t('dashboard.tabs-layout.tab-options.title-option', 'Title'),
          render: () => <TabTitleInput tab={model} />,
        })
      ),
    [model]
  );

  const layoutCategory = useLayoutCategory(layout);

  const editOptions = [tabCategory, layoutCategory];

  const conditionalRenderingCategory = useMemo(
    () => useConditionalRenderingEditor(model.state.conditionalRendering),
    [model]
  );

  if (conditionalRenderingCategory) {
    editOptions.push(conditionalRenderingCategory);
  }

  return editOptions;
}

function TabTitleInput({ tab }: { tab: TabItem }) {
  const { title, isNew } = tab.useState();
  const ref = useEditPaneInputAutoFocus({ autoFocus: isNew });

  return <Input ref={ref} value={title} onChange={(e) => tab.onChangeTitle(e.currentTarget.value)} />;
}
