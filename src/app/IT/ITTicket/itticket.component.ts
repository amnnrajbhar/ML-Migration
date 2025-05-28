import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-itticket',
  templateUrl: './itticket.component.html',
  styleUrls: ['./itticket.component.css']
})
export class ITTicketComponent implements OnInit {
  currentUser: any;
  EmpId: any;

  constructor() { }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.EmpId = this.currentUser.employeeId;
  }

}
