import { findElements } from '@fullcalendar/core'

export default class ResourceDataGridWrapper {

  constructor(private el: HTMLElement) {
  }


  getRowInfo() {
    let trs = findElements(this.el, 'tr')
    let infos = []

    for (let tr of trs) {
      let resourceCell = tr.querySelector('.fc-datagrid-cell.fc-resource')

      if (resourceCell) {
        infos.push(buildResourceInfoFromCell(resourceCell))
      } else {
        let groupCell = tr.querySelector('.fc-datagrid-cell.fc-resource-group')

        if (groupCell) {
          infos.push(buildGroupInfoFromCell(groupCell))
        }
      }
    }

    return infos
  }


  getResourceInfo() {
    return this.getRowInfo().filter((rowInfo) => rowInfo.type === 'resource')
  }


  getResourceIds() {
    return this.getResourceInfo().map((info) => info.resourceId)
  }


  getSpecificResourceInfo(resourceId) {
    let cellEl = this.getResourceCellEl(resourceId)

    if (cellEl) {
      return buildResourceInfoFromCell(cellEl)
    }
  }


  getResourceCellEl(resourceId) {
    return this.el.querySelector(`.fc-datagrid-cell[data-resource-id="${resourceId}"]`) as HTMLElement
  }


  getResourceCellEls(resourceId) {
    let selector = '.fc-datagrid-cell.fc-resource'

    if (resourceId) {
      selector += `[data-resource-id="${resourceId}"]`
    }

    return findElements(this.el, selector)
  }


  getAllRows() {
    return findElements(this.el, 'tr')
  }


  clickFirstExpander() {
    $(this.el.querySelector('.fc-datagrid-expander')).simulate('click')
  }


  clickExpander(resourceId) {
    $(this.getExpanderEl(resourceId)).simulate('click')
  }


  getExpanderEl(resourceId) {
    return this.getResourceCellEl(resourceId).querySelector('.fc-datagrid-expander')
  }


  isRowExpanded(resourceId) {
    let iconEl = this.getExpanderEl(resourceId).querySelector('.fc-icon')

    if (iconEl.classList.contains('fc-icon-plus-square')) {
      return false
    } else if (iconEl.classList.contains('fc-icon-minus-square')) {
      return true
    } else {
      throw new Error('Resource row is neither expanded or contracted.')
    }
  }


  getRowIndentation(resourceId) {
    return this.getResourceCellEl(resourceId).querySelectorAll('.fc-icon').length
  }

}


function buildResourceInfoFromCell(cellEl) {
  return {
    type: 'resource',
    resourceId: cellEl.getAttribute('data-resource-id'),
    text: $(cellEl.querySelector('.fc-datagrid-cell-main')).text(),
    cellEl,
    rowEl: cellEl.parentNode
  }
}


function buildGroupInfoFromCell(cellEl) {
  return {
    type: 'group',
    text: $(cellEl.querySelector('.fc-datagrid-cell-main')).text(),
    cellEl,
    rowEl: cellEl.parentNode
  }
}
