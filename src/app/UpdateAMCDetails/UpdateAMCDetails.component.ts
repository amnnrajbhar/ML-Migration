import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppComponent } from '../app.component';
import { AuthData } from '../auth/auth.model';
import { APIURLS } from '../shared/api-url';
import { AppService } from '../shared/app.service';
import { HttpService } from '../shared/http-service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
import { AmcvisitDetails } from './AMCDetails.model';
declare var $: any;

@Component({
  selector: 'app-UpdateAMCDetails',
  templateUrl: './UpdateAMCDetails.component.html',
  styleUrls: ['./UpdateAMCDetails.component.css'],
})

export class UpdateAMCDetailsComponent implements OnInit {

  VisitorId: any;
  isLoading: boolean = false;
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  errMsgModalPop: string = "";
  successMsg: string = "";
  VisitorDetails: any = {};
  amcdetailsmodel = {} as AmcvisitDetails;


  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute, private http: HttpClient,
  ) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.VisitorId = this.route.snapshot.paramMap.get('id');
      this.getVisitorDetails();
      this.getDepartList();
    }
  }

  getVisitorDetails() {
    this.isLoading = true;
    let connection: any;
    connection = this.httpService.getById(APIURLS.BR_MASTER_VISITOR_POST_API, this.VisitorId);
    connection.then((data) => {
      if (data) {
        this.VisitorDetails = data;
        this.getAMCDetailsById();
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
    })
  }

  getAMCDetailsById() {
    this.isLoading = true;
    let connection: any;
    connection = this.httpService.getById(APIURLS.GET_AMC_VISIT_DETAILS_BY_ID, this.VisitorId);
    connection.then((data) => {
      if (data.length > 0) {
        this.amcdetailsmodel = Object.assign({}, data[0])
        data.forEach(element => {
          let equip = new AmcvisitDetails();
          equip.equipmentId = element.equipmentId;
          equip.equipmentName = element.equipmentName;
          equip.modelNo = element.modelNo;
          equip.status = element.status;
          equip.id = element.id;
          this.EquipmentList.push(equip);
        });
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
    })
  }

  EquipmentList: any[] = [];
  onUpdateClick() {
    this.isLoading = true;
    let connection: any;
    if(this.EquipmentList.length <=0)
    {
      alert("Please update atleast one equiment details.");
      return;
    }
    else
    {
    this.amcdetailsmodel.updatedBy = this.currentUser.employeeId;
    this.amcdetailsmodel.visitorId = this.VisitorId;

    if (this.amcdetailsmodel.id > 0) {
      this.EquipmentList.forEach((element) => {
        this.amcdetailsmodel.equipmentId = element.equipmentId;
        this.amcdetailsmodel.equipmentName = element.equipmentName;
        this.amcdetailsmodel.modelNo = element.modelNo;
        this.amcdetailsmodel.status = element.status;
        this.amcdetailsmodel.id = element.id;
        connection = this.httpService.put(APIURLS.UPDATE_AMC_VISIT_DETAILS, this.amcdetailsmodel.id, this.amcdetailsmodel);
      });

    }
    else {
      this.EquipmentList.forEach((element) => {
        this.amcdetailsmodel.equipmentId = element.equipmentId;
        this.amcdetailsmodel.equipmentName = element.equipmentName;
        this.amcdetailsmodel.modelNo = element.modelNo;
        this.amcdetailsmodel.status = element.status;
        connection = this.httpService.post(APIURLS.UPDATE_AMC_VISIT_DETAILS, this.amcdetailsmodel);
      });
    }

    connection.then((data) => {
      if (data == 200 || data.id > 0) {
        swal({
          title: "Message",
          text: "Deatils updated successfully.",
          icon: "success",
          dangerMode: false,
          buttons: [false, true]
        });
        let route = 'dashboard-emp';
        this.router.navigate([route]);
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
      swal({
        title: "Message",
        text: "Error updating details.",
        icon: "worning",
        dangerMode: false,
        buttons: [false, true]
      });
    });

      
  }
  }
  clearInput() {
    this.amcdetailsmodel = {} as AmcvisitDetails;
  }

  onBack()
  {
    let route = 'dashboard-emp';
    this.router.navigate([route]);
  }
  count = 0;
  onAddLineClick() {
    this.isLoading = true;
    this.EquipmentList.push({});
    //console.log(this.departmentList);
    this.count++;
    this.isLoading = false;
  }

  RemoveLine(no, id) {
    this.isLoading = true;
    this.EquipmentList.splice(no, 1);
    // console.log(this.departmentList);
    this.count--;
    if (id > 0) {
      this.deleteEntry(id);
    }

    this.isLoading = false;
  }
  DepartmentList: any[] = [];
  getDepartList() {

    this.httpService.get(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0) {
        this.DepartmentList = data.filter(x => x.isActive).sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });

      }
    }).catch(error => {
      this.isLoading = false;
      this.DepartmentList = [];
    });
  }
  deleteEntry(id) {
    this.isLoading = true;
    let connection: any;

    connection = this.httpService.delete(APIURLS.UPDATE_AMC_VISIT_DETAILS, id);
    connection.then((data) => {
      if (data == 200 || data.id > 0) {
      }
      this.isLoading = false;
    }).catch((error) => {
      this.isLoading = false;
      swal({
        title: "Message",
        text: "Error updating details.",
        icon: "worning",
        dangerMode: false,
        buttons: [false, true]
      });
    });

  }
}
