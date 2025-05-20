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
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.EmpId = this.currentUser.employeeId;
  }

}
