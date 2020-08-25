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

      if (prop.data && Array.isArray(prop.data) && prop.data.length > 0) {

        this.treeNode = [...new Set(prop.data.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));
      } else {

        this.treeNode = [];
      }

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

  initialliazeConfig() {

    this.treeNode.map(n => {  // set expanded, searchable, searched poperty

      n.searched = true;
      n.visible = n.visible != null ? n.visible : true;
      n.disabled = n.disabled != null ? n.disabled : false;
      n.expanded = n.expanded != null ? n.expanded : this.expanded;
    });

    const selectedNodes = this.getNode({} as MvTree, 'checked');
    (selectedNodes || []).map((n) => {

      this.currentNode = n;
      this.visitChildNodes(n, n.checked);
    });

    this.rootNode = this.getNode({} as MvTree, 'rootNode');

    this.isCheckedAll();

    if (this.returnValueOnInit) {

      setTimeout(() => {
        this.valueChange.emit(this.checkedNodes); // emit checked nodes initially
      }, 1000);
    }
  }

  isCheckedAll() {

    const checkedNodes = this.treeNode.filter(n => n.checked && n.visible);
    const allNode = this.treeNode.filter(n => (n.visible));

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

  checkAll(e: any) {

    if (e) {

      this.rootNode.map(n => {

        n.checked = e.checked;
        this.currentNode = n;
        this.visitChildNodes(n, e.checked); // indeterminate will be set from here
      });

      this.isCheckedAll();
      this.valueChange.emit(this.checkedNodes);
    }
  }

  onCheckChange(node: MvTree) {

    node.checked = !node.checked;

    if (!node.parentNodeId) { // set indeterminate for root node

      const child = this.getNode(node, 'childNode');
      child.map(x => {

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

  setIndeterminate(node: MvTree) {  // set indeterminate

    const child = this.getNode(node, 'childNode');
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

  private visitParentNodes(node: MvTree) { // loop through parent

    const parent = this.getNode(node, 'parentNode');
    if (parent && parent.length === 1) {

      const child = this.getNode(parent[0], 'childNode');
      const checkedChild = child.filter(n => n.checked);

      if (child.length === checkedChild.length) {

        parent[0].checked = true;
        parent[0].indeterminate = false;
      } else if (checkedChild.length > 0) {

        parent[0].checked = this.currentNode.nodeId !== node.nodeId ? false : this.currentNode.checked;
        parent[0].indeterminate = true;
      } else {

        parent[0].checked = this.currentNode.nodeId !== node.nodeId ? false : this.currentNode.checked;
        parent[0].indeterminate = false;
      }

      this.visitParentNodes(parent[0]);
    } else if (parent && parent.length > 1) {

      console.error('A node can\'t have multiple parents!');
    }
  }

  private visitChildNodes(node: MvTree, checked: boolean) { // loop through child

    const child = this.getNode(node, 'childNode');

    if (child && child.length > 0) {

      child.map((o) => {

        if (o.visible) { // if action is uncheck, keep same value o.checked of the node, else checked value of checked node

          o.checked = (o.disabled && !this.currentNode.checked) ? o.checked : checked;
        }

        this.visitChildNodes(o, checked);
      });
    } else {  // if checked node is lowest child or has no child

      this.visitParentNodes(node);
      if (node.checked && !this.checkedNodes.includes(node.nodeId)) {

        this.checkedNodes.push(node.nodeId);
      } else if (!node.checked) {

        this.checkedNodes = this.checkedNodes.filter(x => (x !== node.nodeId));
      }
    }
  }

  getNode(node: MvTree, type: string): MvTree[] {

    if (type === 'node') { // get Node detail

      return this.treeNode.filter(n => (n.nodeId && node.nodeId));
    } else if (type === 'rootNode') { // get rootNode list

      return this.treeNode.filter(n => (!n.parentNodeId && n.visible)); // parentNodeId null for rootNode
    } else if (type === 'parentNode') { // get parentNode list

      return this.treeNode.filter(n => (n.nodeId === node.parentNodeId && n.visible));
    } else if (type === 'childNode') {  // get childNode list

      return this.treeNode.filter(n => (n.parentNodeId === node.nodeId && n.visible));
    } else if (type === 'checked') { // get checked nodes, get only lowest child, lowest level nodes doesnt have child

      return this.treeNode.filter(n => (n.checked && !this.hasChild(n)));
    }
  }

  hasChild(node: MvTree): boolean {

    const child = this.getNode(node, 'childNode');

    if (child && child.length > 0) {

      return true;
    } else {

      return false;
    }
  }

  searchNode(event: any) {

    this.unSetAllSearchedNodes();
    this.searchText = event.srcElement ? event.srcElement.value.toLowerCase() : '';

    const filteredNode = this.getFilteredNode();
    filteredNode.map(x => { // make node searched
      x.searched = true;
      this.setParentNodeSearched(x);
    });
  }

  filterNode(view: string) {

    this.selected = view;

    if (['expandAll', 'collapseAll'].includes(this.selected)) { // expand collapse

      this.expanded = !this.expanded;

      // make node expanded
      this.treeNode.map(x => {
        x.expanded = this.expanded;
      });

    } else { // toggle nodes

      this.unSetAllSearchedNodes();

      if (this.searchable && this.searchInput) {

        this.searchInput.nativeElement.value = '';
        this.searchText = '';
      }

      const filteredNode = this.getFilteredNode();
      filteredNode.map(x => { // make node searched
        x.searched = true;
        this.setParentNodeSearched(x);
      });
    }
  }

  private getFilteredNode(): MvTree[] {

    let searchedNode: MvTree[];

    if (this.selected === 'checked') {

      searchedNode = this.treeNode.filter(x => (x.node.toLowerCase().includes(this.searchText) && x.checked));
    } else if (this.selected === 'unchecked') {

      searchedNode = this.treeNode.filter(x => (x.node.toLowerCase().includes(this.searchText) && !x.checked));
    } else { // all

      searchedNode = this.treeNode.filter(x => x.node.toLowerCase().includes(this.searchText));
    }

    return searchedNode;
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

    if (this.searchable && this.searchInput) {

      this.searchInput.nativeElement.value = '';
      this.searchText = '';
      this.searchNode({});
    }
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
  readonly nodeId: number;
  readonly node: string;
  readonly parentNodeId: number;
  checked: boolean;
  visible: boolean | true; // optional, send false if a node needs to be hidden
  disabled: boolean | false; // optional, send true if a node needs to be hidden
  // below properties need not to be send as data
  searched: boolean | true;
  expanded: boolean | true;
  indeterminate: boolean | false;
}

export interface MvConfig {
  data: MvTree[];
  expanded: boolean | true;
  searchable: boolean | true;
  returnValueOnInit: boolean | true;
}
