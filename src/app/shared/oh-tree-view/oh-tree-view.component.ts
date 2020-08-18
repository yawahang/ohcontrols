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
  rootNode: MvTree[];
  currentNode: MvTree; // currently value changed node
  checkedNodes: number[] = [];

  searchText = ''; // search value
  indeterminate = false; // tree all check is indeterminate
  selected = 'all'; // tree toggle value
  checkedAll: boolean; // is all tree node checked
  searchable = true; // tree is searchable
  expanded = true; // tree node is expanded
  returnValueOnInit = true; // return selected values on Initialization

  @Input('config') set config(prop: MvConfig) {

    if (prop) {

      this.treeNode = prop.data || [];

      this.searchable = prop.searchable != null ? prop.searchable : true;
      this.expanded = prop.expanded != null ? prop.expanded : true;
      this.returnValueOnInit = prop.returnValueOnInit != null ? prop.returnValueOnInit : true;
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
      o.expanded = o.expanded != null ? o.expanded : this.expanded;
      o.searchable = o.searchable != null ? o.searchable : this.searchable;
      o.searched = true;
    });

    // appendChildNodes
    this.rootNode = this.getNode({} as MvTree, 'rootNode');
    this.rootNode.forEach(n => {
      this.appendChildNodes(n);
    });

    this.isCheckedAll();

    if (this.returnValueOnInit) {

      setTimeout(() => {
        this.valueChange.emit(this.checkedNodes); // emit checked nodes initially
      }, 300);
    }
  }

  private appendChildNodes(node: MvTree) {

    node.child = this.getNode(node, 'childNode');

    if (node.child && node.child.length > 0) {

      node.child.forEach(n => {

        n.child = this.getNode(n, 'childNode');

        if (n.child && n.child.length > 0) {

          this.appendChildNodes(n);
        }

        this.currentNode = n;
        this.visitChildNodes(n, n.checked);
      });
    } else {

      this.currentNode = node;
      this.visitChildNodes(node, node.checked);
    }
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

    this.currentNode = node;
    this.visitChildNodes(node, node.checked);

    this.isCheckedAll();
    this.valueChange.emit(this.checkedNodes);
  }

  private setIndeterminate(node: MvTree) {

    // set indeterminate
    if (node.child && node.child.length > 0) {

      const checkedChild = node.child.filter(n => n.checked);

      if (node.child.length === checkedChild.length) {

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

    const parent = this.getNode(node, 'parentNode');
    if (parent && parent.length > 1) {

      console.error('A node can\'t have multiple parents!');
    } else if (parent && parent.length === 1) {

      this.visitParentNodes(parent[0]);
    }
  }

  private visitChildNodes(node: MvTree, checked: boolean) {

    if (node.child && node.child.length > 0) { // visit child node

      node.child.forEach(c => {

        if (c.visible) { // if action is uncheck, keep same value o.checked of the node, else checked value of checked node

          c.checked = (c.disabled && !this.currentNode.checked) ? c.checked : checked;
        }

        this.visitChildNodes(c, checked);
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

  private getNode(node: MvTree, type: string): MvTree[] {

    if (type === 'rootNode') { // get rootNode list

      return this.treeNode.filter(n => (!n.parentNodeId && n.visible)); // parentNodeId null for rootNode
    } else if (type === 'parentNode') { // get parentNode list

      return this.treeNode.filter(n => (n.nodeId === node.parentNodeId && n.visible));
    } else if (type === 'childNode') {  // get childNode list

      return this.treeNode.filter(n => (n.parentNodeId === node.nodeId && n.visible));
    } else if (type === 'checked') { // get checked nodes, get only lowest child, lowest level nodes doesnt have child

      return this.treeNode.filter(n => (n.checked && (n.child && n.child.length === 0)));
    }
  }

  searchNode(event: any) {

    if (event) {

      this.unSetAllSearchedNodes();
      this.searchText = event.srcElement ? event.srcElement.value.toLowerCase() : '';
      let searchedNode: MvTree[];

      if (this.searchText && this.searchText !== '') {

        if (this.selected === 'all') {

          searchedNode = this.treeNode.filter(x => x.node.toLowerCase().includes(this.searchText));
        } else if (this.selected === 'checked') {

          searchedNode = this.treeNode.filter(x => (x.node.toLowerCase().includes(this.searchText) && x.checked));
        } else if (this.selected === 'unchecked') {

          searchedNode = this.treeNode.filter(x => (x.node.toLowerCase().includes(this.searchText) && !x.checked));
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
      } else if (this.selected === 'unchecked') {

        toggleNodes = this.treeNode.filter(x => !x.checked);
      } else {

        toggleNodes = [];
      }

      // make node searched
      toggleNodes.forEach(x => {
        x.searched = true;
        this.setParentNodeSearched(x);
      });
    }
  }

  private setParentNodeSearched(node: MvTree) {

    const parent = this.getNode(node, 'parentNode');
    if (parent && parent.length > 0) {

      parent[0].searched = true;
      this.setParentNodeSearched(parent[0]);
    }
  }

  private unSetAllSearchedNodes() {

    this.treeNode.map(x => {
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
  expanded: boolean | true;
  searchable: boolean | true;
  returnValueOnInit: boolean | true;
}
