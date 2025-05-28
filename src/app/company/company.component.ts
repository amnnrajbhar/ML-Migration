import { AuthData } from './../auth/auth.model';
import { Company } from './company.model';
import { User } from './../masters/user/user.model';
import { AppComponent } from './../app.component';
import { APIURLS } from './../shared/api-url';
import { HttpService } from './../shared/http-service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
declare var jQuery: any;

@Component({
  selector: 'app-profile',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent implements OnInit {

  public tableWidget: any;
  stateList!: any[];
  SelState: any;
  licenseList: Company[];
  id1: number = 0;
  companyList: Company[];
  companyItem: Company = new Company(0, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '',0, 0, 0, '', '', Number(new Date()), Number(new Date()), 0,0,0,true,'');;
  isLoading: boolean = false;
  errMsg: string = "";
  isLoadingPop: boolean = false;
  errMsgPop: string = "";
  errMsgPAN: string = "";
  errMsgGSTIN: string = "";
  isValidgstin: boolean = false;
  activationDate: Date = new Date();
  expiryDate: Date = new Date();
  isEdit: boolean = false;
  regBtnHide: boolean = true;
  formData: FormData = new FormData();
  postParams: any;
  file!: File;
  fileUploadMsgPop: string = "";
  path: string = "";
  constructor(private appService: AppComponent,  private router: Router, private httpService: HttpService) { }


  private initDatatable(): void {
    let exampleId: any = jQuery('#licenseTable');
    this.tableWidget = exampleId.DataTable();
  }

  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy();
      this.tableWidget = null;
    }
    setTimeout(() => this.initDatatable(), 0);
  }


  ngOnInit() {
      this.path = this.router.url;
      var chkaccess = this.appService.validateUrlBasedAccess(this.path);
      if(chkaccess == true){
        ////console.log(chkaccess);
        this.getCompanyMasterList();
        this.getStateList();
      }
      else 
        this.router.navigate(["/unauthorized"]);
  }

  ngAfterViewInit() {
    this.initDatatable();
  }

  
   getCompanyMasterList() {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_MASTER_COMPANY_ALL_API).then((data: any) => {
      this.isLoading = false;
      if (data.length > 0){
          this.companyList = data;
          if (data.companyList.filter((e:any) => e.cmpid == 1).length > 0) {
              this.regBtnHide = false;
          }
        this.reInitDatatable();
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.licenseList = [];
    });
  }


  onAddCompany(isEdit: boolean, data: Company) {
    this.isEdit = isEdit;
    this.errMsgPop = "";
    this.isLoadingPop = false;
    if (this.isEdit) {
        this.companyItem = data;
        // if (this.companyItem.domainName.indexOf('@') >= 0 && this.companyItem.domainName.indexOf('.in') >= 0) {
        //     this.companyItem.domainName = this.companyItem.domainName.substring(this.companyItem.domainName.indexOf('@') + 1, this.companyItem.domainName.indexOf('.in'));
        // }
      this.SelState = this.stateList.find((s:any) => s.sname === this.companyItem.stateName);
    }
    else {
      this.companyItem = new Company(0, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '',0, 0, 0, '', '', Number(new Date()), Number(new Date()), 0, 0, 0,  true,'');
      this.SelState = null;
    }
    jQuery("#myModal").modal('show');
  }

  calculateRemainingLicense(totallic:number,usedlic:number)
  {
    return (totallic - usedlic);
  }

  getStateList() {
    this.httpService.get(APIURLS.BR_MASTER_COMPANY_API).then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.stateList;
      }
    }).catch((error)=> {
      this.stateList = [];
    });
  }

  onSaveCompany(status: boolean) {
    this.errMsg = "";
    this.errMsgPop = "";
    this.isLoadingPop = true;
    this.companyItem.stateName = this.SelState.sname;
    this.companyItem.stateCode = this.SelState.scode;
    this.companyItem.activationDate = Number(new Date(this.activationDate));
    this.companyItem.validTillDate = Number(new Date(this.expiryDate)) + 90;
    //this.validateDomainName();
    let connection: any;
    if (!this.isEdit) {
        connection = this.httpService.post(APIURLS.BR_MASTER_COMPANY_API, this.companyItem);
    }
    else {
        connection = this.httpService.put(APIURLS.BR_MASTER_COMPANY_API, this.companyItem.id, this.companyItem);
    }

    connection.then((data: any) => {
      this.isLoadingPop = false;
      if (data.status == 'SUCCESS') {
        jQuery("#myModal").modal('hide');
        this.getCompanyMasterList();
      }
      else {
          this.errMsgPop = data;
          // if (this.companyItem.domainName.indexOf('@') >= 0 && this.companyItem.domainName.indexOf('.in') >= 0) {
          //     this.companyItem.domainName = this.companyItem.domainName.substring(this.companyItem.domainName.indexOf('@') + 1, this.companyItem.domainName.indexOf('.in'));
          // }
      }
    }).catch((error)=> {
      this.isLoadingPop = false;
      this.errMsgPop = 'Error saving company data..';
    });
  }

  validateDomainName()
  {
      if (this.companyItem.domainName != '') {
          if (this.companyItem.domainName.startsWith("@")) {
              if (this.companyItem.domainName.endsWith(".in")) {
                  //this.companyItem.domainName
              }
              else {
                  this.companyItem.domainName = this.companyItem.domainName + ".in";
              }
          }
          else {
              if (this.companyItem.domainName.endsWith(".in")) {
                  this.companyItem.domainName = "@" + this.companyItem.domainName;
              }
              else {
                  this.companyItem.domainName = "@" + this.companyItem.domainName + ".in";
              }
          }
      }
  }

  onStatusChange(custId) {
    this.errMsg = "";
    this.isLoading = true;
    this.httpService.delete(APIURLS.BR_MASTER_CUSTOMER_API, custId).then((data: any) => {
      this.isLoading = false;
      if (data.status == 'SUCCESS') {
        this.getCompanyMasterList();
      }
      else {
        this.errMsg = data;
      }
    }).catch((error)=> {
      this.isLoading = false;
      this.errMsg = 'Error saving company data..';
    });
  }

  onPANChange(pan) {
    if (pan != "") {
      this.errMsgPAN = "";
      //this.isValidgstin = true;
    }
    if (this.companyItem.gstn != "") {
      this.validateGstin(this.companyItem.gstn);
    }
  }
  validateGstin(gstn) {
    if (gstn == "") {
      this.errMsgPAN = '';
      this.errMsgGSTIN = '';
      this.isValidgstin = false;
    }
    else if (this.companyItem.pan == "") {
      this.errMsgPAN = 'Please Enter PAN';
      this.isValidgstin = true;
    }
    else {
      if (gstn.substring(2, 12) != this.companyItem.pan) {
        this.errMsgGSTIN = 'Please Enter Valid GSTIN';
        this.isValidgstin = true;
      }
      else {
        this.errMsgGSTIN = '';
        this.isValidgstin = false;
      }
      if ((this.companyItem != null)) {
        if (this.companyItem.stateName != "") {
          if (gstn.substring(0, 2) != this.companyItem.stateName.substring(0, 2)) {
            // alert("gstin" + en_gstin.substring(0, 2) + "state" + this.entityItem.cust_state.substring(0, 2) + "selst" + this.SelState.sname);
            this.errMsgGSTIN = 'Please Enter Valid GSTIN';
            this.isValidgstin = true;
          }
        }
        else {
          this.errMsgGSTIN = '';
          this.isValidgstin = false;
        }
      }
      else {
        this.errMsgGSTIN = '';
        this.isValidgstin = false;
      }
      this.errMsgPAN = '';
      //alert(vend);
    }
  }
  onStateChange() {
    if (this.companyItem.gstn != "") {
      this.validateGstin(this.companyItem.gstn);
    }
  }
  onImgFileChange(event: any) {
      this.errMsgPop = '';
      this.formData = new FormData();
      //debugger;
      let fileList: FileList = event.target.files;
      if (fileList.length > 0) {
          //let file: File = fileList[0];
          this.file = fileList[0];
          if (this.file.type.indexOf('image') === -1) {
              this.errMsgPop = " Select Image Type File to Upload";
          }
          //let formData: FormData = new FormData();
          this.formData.append("File", this.file);
      }
      //window.location.reload();
  }

  uploadLogo() {
      this.errMsgPop = '';
      this.fileUploadMsgPop = '';
      if (this.file == undefined || this.file == null) {
          this.errMsgPop = " Select Image to Upload";
      }
      else if (this.file.type.indexOf('image') === -1) {
          this.errMsgPop = " Select Image Type File to Upload";
      }
      else if (this.file.size > 10000) {
          this.errMsgPop = " Image size should be within 10KB";
      }
      else {
          let connection: any;
          connection = this.httpService.postforUploadFiles(APIURLS.BR_UPLOAD_COMPANY_LOGO_API, this.companyItem.id, this.formData);
          connection.then((data: any) => {
              this.formData = new FormData();
              this.fileUploadMsgPop = "Upload Sucessfull";
              //if (data.status == 'SUCCESS') {
                //  debugger;
                  //this.companyItem = data;
                  //jQuery("#myModal").modal('show');
                  //this.fileUploadMsgPop = data;
                  // }
                  // else {
                  // this.errMsgPop = data;
             // }
          }).catch((error)=> {
             // debugger;
              this.isLoadingPop = false;
              this.errMsgPop = 'Error uploading file ..';
          });
      }
  }

}

