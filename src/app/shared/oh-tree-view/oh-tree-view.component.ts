import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'oh-tree-view',
  templateUrl: './oh-tree-view.component.html',
  styleUrls: ['./oh-tree-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class OHTreeViewComponent implements OnInit, OnDestroy {

  subs: Subscription = new Subscription();

  @Output() valueChange = new EventEmitter<any>();
  @ViewChild('searchInput', { static: false }) searchInput: any;

  treeNode: MvTree[];
  searchText = ''; // search value
  checkedNodes: number[] = [];
  indeterminate = false; // tree all check is indeterminate
  selected = 'all'; // tree toggle value
  checkedAll: boolean; // is all tree node checked
  searchable = true; // tree is searchable
  expanded = true; // tree node is expanded
  currentNode: MvTree; // currently value changed node
  rootNode: MvTree[];

  @Input('config') set config(prop: MvConfig) {

    if (prop) {

      if (prop.data) {

        this.treeNode = prop.data;
      } else {

        this.treeNode = [];
      }

      this.searchable = prop.searchable != null ? prop.searchable : true;
      this.expanded = prop.expanded != null ? prop.expanded : true;
      this.initialliazeConfig();
    }
  }

  constructor() {

  }

  ngOnInit() {

  }

  private initialliazeConfig() {

    // set expanded, searchable, searched poperty
    this.treeNode.forEach(o => {
      o.expanded = this.expanded;
      o.searchable = this.searchable;
      o.searched = true;
    });

    // set rootNodeId, checked and indeterminate nodes
    this.rootNode = this.getNode(0, 'rootNode');
    this.rootNode.forEach(n => {

      n.rootNodeId = n.nodeId;
      n.child = this.getNode(n.nodeId, 'parentNodeId');
      if (n.child.length > 0) {

        this.appendChildNodes(n.child);
      }

      this.currentNode = n;
      this.visitChildNodes(n, n.checked);
    });

    this.isCheckedAll();
    setTimeout(() => {
      this.valueChange.emit(this.checkedNodes); // emit checked nodes initially
    }, 300);
  }

  private appendChildNodes(child: MvTree[]) {

    child.forEach(n => {

      n.rootNodeId = n.nodeId;
      n.child = this.getNode(n.nodeId, 'parentNodeId');

      if (n.child.length > 0) {

        this.appendChildNodes(n.child);
      }

      this.currentNode = n;
      this.visitChildNodes(n, n.checked);
    });
  }

  checkAll(e: any) {

    if (e) {

      this.rootNode.forEach(n => {

        n.checked = e.checked;
        this.currentNode = n;
        this.visitChildNodes(n, e.checked); // indeterminate will be set from here
      });

      this.isCheckedAll();
      this.valueChange.emit(this.checkedNodes);
    }
  }

  private isCheckedAll() { // set checked, indeterminate for check all checkbox

    const checkedNodes = this.treeNode.filter(n => (n.checked && n.visible));
    const allNode = this.treeNode.filter(n => n.visible);

    if (allNode.length === checkedNodes.length) {

      this.checkedAll = true;
      this.indeterminate = false;
    } else if (checkedNodes.length > 0) {

      this.checkedAll = false;
      this.indeterminate = true;
    } else {

      this.checkedAll = false;
      this.indeterminate = false;
    }
  }

  onCheckChange(node: MvTree) {

    node.checked = !node.checked;

    if (node.parentNodeId == null && node.nodeId === node.rootNodeId) { // set indeterminate for root node

      const child = this.getNode(node.nodeId, 'rootNodeId');
      child.forEach(x => {

        x.checked = node.checked;
        this.currentNode = x;
        this.visitChildNodes(x, node.checked);
      });
    } else {

      this.currentNode = node;
      this.visitChildNodes(node, node.checked);
    }

    this.isCheckedAll();
    this.valueChange.emit(this.checkedNodes);
  }

  private setIndeterminate(node: MvTree) {

    // set indeterminate
    const child = this.getNode(node.nodeId, 'parentNodeId');
    const checkedChild = child.filter(n => n.checked);
    if (child.length > 0) {

      if (child.length === checkedChild.length) {

        node.checked = true;
        node.indeterminate = false;
      } else if (checkedChild.length > 0) {

        node.checked = this.currentNode.nodeId !== node.nodeId ? false : this.currentNode.checked;
        node.indeterminate = true;
      } else {

        node.checked = this.currentNode.nodeId !== node.nodeId ? false : this.currentNode.checked;
        node.indeterminate = false;
      }
    }
  }

  private visitParentNodes(node: MvTree) {

    // loop through parent
    this.setIndeterminate(node);

    const parent = this.getNode(node.parentNodeId, 'nodeId');
    if (parent.length === 1) {

      this.visitParentNodes(parent[0]);
    }
  }

  private visitChildNodes(node: MvTree, checked: boolean) {

    const parent = this.getNode(node.nodeId, 'parentNodeId');
    if (parent && parent.length > 0) { // visit child of parentNodeId

      parent.forEach(o => {

        if (!o.rootNodeId && node.rootNodeId > 0 && o.parentNodeId !== null && node.nodeId !== node.rootNodeId) {
          o.rootNodeId = node.rootNodeId;
        }

        if (o.visible) { // if action is uncheck, keep same value o.checked of the node, else checked value of checked node

          o.checked = (o.disabled && !this.currentNode.checked) ? o.checked : checked;
        }

        this.visitChildNodes(o, checked);
      });
    } else {  // if checked node is lowest child or has no child, visit parent of node

      this.visitParentNodes(node);
      if (node.checked && !this.checkedNodes.includes(node.nodeId)) {

        this.checkedNodes.push(node.nodeId);
      } else if (!node.checked) {

        this.checkedNodes = this.checkedNodes.filter(x => (x !== node.nodeId));
      }
    }
  }

  private getNode(nodeId: number, type: string): MvTree[] {

    if (type === 'nodeId') { // get node detail

      return this.treeNode.filter(n => (n.nodeId === nodeId && n.visible));
    } else if (type === 'parentNodeId') { // get child list

      return this.treeNode.filter(n => (n.parentNodeId === nodeId && n.visible));
    } else if (type === 'rootNodeId') { // get root detail

      return this.treeNode.filter(n => (n.rootNodeId === nodeId && n.visible));
    } else if (type === 'rootNode') { // get root node list

      return this.treeNode.filter(n => (!n.parentNodeId && n.visible));
    } else if (type === 'checked') { // get checked nodes

      return this.treeNode.filter(n => (n.checked && (n.child && n.child.length > 0))); // hasChild => get only lowest child
    }
  }

  searchNode(event: any) {

    if (event) {

      this.unSetAllSearchedNodes();
      this.searchText = event.srcElement ? event.srcElement.value : '';
      let searchedNode: MvTree[];

      if (this.searchText && this.searchText !== '') {

        if (this.selected === 'all') {

          searchedNode = this.treeNode.filter(x => x.node.toLowerCase().includes(this.searchText.toLowerCase()));
        } else if (this.selected === 'checked') {

          searchedNode = this.treeNode.filter(x => (x.node.toLowerCase().includes(this.searchText.toLowerCase()) && x.checked));
        } else if (this.selected === 'unchecked') {

          searchedNode = this.treeNode.filter(x => (x.node.toLowerCase().includes(this.searchText.toLowerCase()) && !x.checked));
        } else {

          searchedNode = [];
        }

      } else {

        if (this.searchable && this.searchInput) {

          this.searchInput.nativeElement.value = '';
          this.searchText = '';
        }

        if (this.selected === 'all') {

          searchedNode = this.treeNode;
        } else if (this.selected === 'checked') {

          searchedNode = this.treeNode.filter(x => x.checked);
        } else if (this.selected === 'unchecked') {

          searchedNode = this.treeNode.filter(x => !x.checked);
        } else {

          searchedNode = [];
        }
      }

      // make node searched
      searchedNode.forEach(x => {
        x.searched = true;
        this.setParentNodeSearched(x);
      });
    }
  }

  toggleNode(view: string) {

    this.selected = view;

    if (['expandAll', 'collapseAll'].includes(this.selected)) { // expand collapse

      this.expanded = !this.expanded;

      // make node expanded
      this.treeNode.forEach(x => {
        x.expanded = this.expanded;
      });

    } else { // toggle nodes

      this.unSetAllSearchedNodes();

      if (this.searchable && this.searchInput) {

        this.searchInput.nativeElement.value = '';
        this.searchText = '';
      }

      let toggleNodes: MvTree[];

      if (this.selected === 'all') {

        toggleNodes = this.treeNode;
      } else if (this.selected === 'checked') {

        toggleNodes = this.treeNode.filter(x => x.checked);
      } else {

        toggleNodes = this.treeNode.filter(x => !x.checked);
      }

      // make node searched
      toggleNodes.forEach(x => {
        x.searched = true;
        this.setParentNodeSearched(x);
      });
    }
  }

  private setParentNodeSearched(node: MvTree) {

    const parent = this.getNode(node.parentNodeId, 'nodeId');
    if (parent && parent.length > 0) {

      parent[0].searched = true;
      this.setParentNodeSearched(parent[0]);
    }
  }

  private unSetAllSearchedNodes() {

    this.treeNode.forEach(x => {
      x.searched = false;
    });
  }

  clearSearch() {
    this.searchNode({});
  }

  openCloseNode(node: MvTree) {
    node.expanded = !node.expanded;
  }

  trackIndex(index: number): number {
    return index;
  }

  ngOnDestroy() {

    this.subs.unsubscribe();
  }
}

export interface MvTree {
  node: string;
  nodeId: number;
  rootNodeId: number;
  parentNodeId: number;
  checked: boolean;
  searchable: boolean;
  searched: boolean;
  visible: boolean;
  indeterminate: boolean;
  expanded: boolean;
  disabled: boolean;
  child?: MvTree[];
}

export interface MvConfig {
  data: MvTree[];
  expanded: boolean;
  searchable: boolean;
}
