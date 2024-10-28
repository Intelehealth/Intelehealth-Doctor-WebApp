import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar-menu-list',
  templateUrl: './sidebar-menu-list.component.html',
  styleUrls: ['./sidebar-menu-list.component.scss']
})
export class SidebarMenuListComponent {

  @Input('drUnread') drUnread: number;
  @Input('adminUnread') adminUnread: number;
  @Input('pvs') pvs: any;
  @Input('menus') menus: any;
  @Output('toggleSidebar') onToggleSidebar = new EventEmitter();


  toggleSidebar() {
    this.onToggleSidebar.emit()
  }
}
