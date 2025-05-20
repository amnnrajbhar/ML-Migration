import { Component, Input, OnInit } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { AuthData } from '../../../auth/auth.model';
import { APIURLS } from '../../../shared/api-url';
import { AppService } from '../../../shared/app.service';
import { HttpService } from '../../../shared/http-service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser'
import { NgForm } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import swal from 'sweetalert';
declare var require: any;
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-view-employee-profile',
  templateUrl: './view-employee-profile.component.html',
  styleUrls: ['./view-employee-profile.component.css']
})
export class ViewEmployeeProfileComponent implements OnInit {
  employeeId: any;
  details:any={};
  objectType: string = "Employee";
  objectTypeProfile: string = "Employee Profile";
  currentUser: AuthData;
  urlPath: string = '';
  errMsg: string = "";
  isLoading: boolean = false;
  addressList:any[] = [];
  currentTab:string = "official";
  tabIndex: number = 0;
  taskId:any;
  profileId:any;
  action:any;
  comments:string;
  tabsList: string[] = ["official","address","education","experience","family","languages","uploads"];
  documentsList: any[] = [];
  statusList = [
    { type: "Submitted", color:"info" },    
    { type: "Pending For Approval", color:"warning"},
    { type: "Approved", color:"success" },   
  ]
  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute, 
    private location: Location, private readonly sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = true;//this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.profileId = this.route.snapshot.paramMap.get('id')!;
      this.employeeId = this.route.snapshot.paramMap.get('id1')!;
    // this.employeeId = this.currentUser.hrEmployeeId;      
      this.LoadEmployeeDetails(this.employeeId);
    }
    
    this.getProfileData(this.profileId);
    this.getData(this.employeeId);
  }

  LoadEmployeeDetails(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_DETAILS_API, id).then((data: any) => {
      if (data) {
        this.details = data;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  getData(id) {
    this.isLoading = true;

    this.httpService.HRgetById(APIURLS.HR_EMPLOYEE_GET_ADDRESS, id).then((data: any) => {
      if (data) {
        this.addressList = data;
        //console.log(this.addressList);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  profileDetails:any={};
  getProfileData(id)
  {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.TEMPORARY_EMPLOYEE_PROFILE_GET_DETAILS + "/" + id).then((data: any) => {
      if (data) {
        this.profileDetails = data;
        console.log(this.profileDetails);
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }
  
  goBack() {
    this.router.navigate(['/HR/ess/employee-profile-update-list']);
  }

  onBack(){
    this.location.back();
  }

  onPrevious(){
    this.tabIndex--;
    this.currentTab = this.tabsList[this.tabIndex];

  }

onNext(){
  this.tabIndex++;
  this.currentTab = this.tabsList[this.tabIndex];
}

onDataLoaded(data :any){
 // console.log(data);
}


onTabClick(index){  
    this.tabIndex = index;
    this.currentTab = this.tabsList[this.tabIndex];
    this.isLoading = false;
}

getFiles() {
  this.isLoading = true;

  this.httpService.HRget(APIURLS.TEMPORARY_PROFILE_GET_ATTACHMENTS + "/" + this.employeeId ).then((data: any) => {
    if (data && data.length > 0) {
      this.documentsList = data;
    }
    this.isLoading = false;
  }).catch(error => {
    this.isLoading = false;
    swal("Error occurred while fetching details, please check the link.");
  });
}

viewFile(id, fileName){
  if(id <= 0) return;
  let connection: any;
  this.isLoading = true;
  
  connection = this.httpService.HRdownloadFile(APIURLS.HR_EMPLOYEE_GET_DOCUMENT_FILE+"/"+this.employeeId+ "/" + id);

  connection.then((data: any) => {
    // console.log(data);
    // let temp_name = this.visitorsList1.find(s => s.id == id).name;
    // if(data){
    //   var downloadURL = URL.createObjectURL(data);
    //   window.open(downloadURL);
    // }
    
    if (data != undefined) {
      
      if(fileName.toLowerCase().includes(".jpg") || fileName.toLowerCase().includes(".jpeg") || fileName.toLowerCase().includes(".png")){          
        this.showImageInViewer(data);
      }else if(fileName.toLowerCase().includes(".pdf")){          
        this.showPdfInViewer(data);
      }
      else{
        var FileSaver = require('file-saver');
        const imageFile = new File([data], fileName);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
        FileSaver.saveAs(imageFile);
      }        
    }      
    this.isLoading = false;
  }).catch(error => {
    this.isLoading = false;
  });
}


downloadFile(id, fileName){
  if(id <= 0) return;
  let connection: any;
  this.isLoading = true;

  connection = this.httpService.HRdownloadFile(APIURLS.HR_EMPLOYEE_GET_DOCUMENT_FILE+"/"+this.employeeId+ "/" + id);

  connection.then((data: any) => {
          
    if (data != undefined) {        
        var FileSaver = require('file-saver');
        const imageFile = new File([data], fileName);
        //const imageFile = new File([data], fileName, { type: 'application/doc' });
        // console.log(imageFile);
        FileSaver.saveAs(imageFile);
    }      
    this.isLoading = false;
  }).catch(error => {
    this.isLoading = false;
  });
}

imageToShow: any;
showImageInViewer(image: Blob) {  
 let reader = new FileReader();
 reader.addEventListener("load", () => {
    const imageBase64String = reader.result; 
    this.imageToShow = this.sanitizer.bypassSecurityTrustUrl(imageBase64String.toString());
    $("#ImageModal").modal('show');
 }, false);

 if (image) {
    reader.readAsDataURL(image);
 }
}

pdfToShow: any;
showPdfInViewer(file: Blob) {  
//  let reader = new FileReader();
//  reader.addEventListener("load", () => {
//     this.pdfToShow = new Uint8Array(reader.result as ArrayBuffer);
//     $("#PdfModal").modal('show');
//  }, false);

//  if (file) {
//     reader.readAsArrayBuffer(file);
//  }

 var blob = new Blob([file], {type: 'application/pdf'});
 var urlCreator = window.URL;   // || window.webkitURL;
 var pdfUrl = urlCreator.createObjectURL(blob);      
 this.pdfToShow = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
 $("#PdfModal").modal('show');

}
}

