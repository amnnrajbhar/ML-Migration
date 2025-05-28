import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { Location } from '@angular/common';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-employee-transfer',
  templateUrl: './employee-transfer.component.html',
  styleUrls: ['./employee-transfer.component.css']
})
export class EmployeeTransferComponent implements OnInit {
  currentUser!: AuthData;
  constructor( private router: Router) { }

  ngOnInit() {
    console.log('inside');
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    let route = 'HR/transfer/details/' + this.currentUser.hrEmployeeId+"/0/EMP";
      this.router.navigate([route]);
  }

}
