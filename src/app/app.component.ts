import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { HttpService } from './shared/http-service';
import { AuthData } from './auth/auth.model';
import { APIURLS } from './shared/api-url';
import { AutologoutService } from './shared/autologout.service';
import { Component, OnInit } from '@angular/core';
import * as _ from "lodash";
import { HttpClient } from '@angular/common/http';
declare var jQuery: any;
declare var $: any;
import swal from 'sweetalert';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  messageBoardList!: any[];
  tasksList: any[] = [];
  urlList!: any[];
  usrList: any;
  greetMessage: string = '';
  menuListData: any[] = [];
  settingsMenuList: any[] = [];
  uimgList: string = "";
  cmpimg: string = "";
  cmp_name: string = "";
  masterList!: any[];
  //msgBoard!: any[];
  reportList!: any[];
  gstr1List!: any[];
  gstr2List!: any[];
  //purchaseList!: any[];
  dashboardV1!: any[];
  dashboardV2!: any[];
  dashboardV3!: any[];
  searchList!: any[];
  adminList!: any[];
  doclist!: any[];
  drcr!: any[];
  feedback!: any[];
  account!: any[];
  urlfilter!: any[];
  urlAccess!: any[];
  url: string = "";
  dashboard1: boolean = false;
  dashboard2: boolean = true;
  dashboard3: boolean = true;
  loggedIn: boolean = false;
  masterHeader: string = "";
  gstr1Header: string = "";
  gstr2Header: string = "";
  drcrHeader: string = "";
  feedbackHeader: string = "";
  reportHeader: string = "";
  authdata: AuthData;
  lastlogin: any;
  tokenExp;
  expired: boolean = false;
  currentUser!: AuthData;
  hrModulesList :string[] = ["Recruitment","Emp. Services","Separation","Appraisal","ESS"];


  constructor(public authService: AuthService, private router: Router, private httpService: HttpService,
     private autologoutservice: AutologoutService,private http:HttpClient) {
  }

  ngOnInit() {
    localStorage.setItem('lastAction', Date.now().toString());
    this.authdata = JSON.parse(localStorage.getItem('currentUser'));
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    //console.log(this.authdata);
    // console.log(this.authService.authData.isAuth);
    // console.log(this.authService);
    this.lastlogin = this.authService.authData.last_Login_datetime ? this.authService.authData.last_Login_datetime : new Date();
    var dateOffset = (24 * 60 * 60 * 1000) * 45; //45 days
    this.tokenExp = this.authService.authData.token_expiry_date ? this.authService.authData.token_expiry_date : new Date().getTime() + dateOffset;
    this.expired = this.authService.authData.passwordExpired;
    let d = new Date();
    if (d.getHours() > 0 && d.getHours() < 12)
      this.greetMessage = 'Good Morning';
    else if (d.getHours() >= 12 && d.getHours() < 15)
      this.greetMessage = 'Good Afternoon';
    else
      this.greetMessage = 'Good Evening';


    this.getFormList();
    //this.getEmpAddress();
    //this.getUserImg();
    let dt=new Date('2023-04-29');
    let dt1=new Date();
    let yest=("00" + dt.getDate()).slice(-2) + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
    dt.getFullYear() ;
    let today=("00" + dt1.getDate()).slice(-2) + "-" + ("00" + (dt1.getMonth() + 1)).slice(-2) + "-" +
    dt1.getFullYear() ;
   if(dt1<dt)
    {
      this.getbase64image();
    }
    this.cmpimg = '../assets/dist/img/micrologo.png';
    this.getMsgBoardMasterList();
    this.getLocationById(this.authdata.baselocation);
    this.getUIDcount();
    this.getPendingTasksSummary();
  }
  image:any;
  getbase64image()
  {
    this.http.get('../../assets/dist/img/GCSurana.jpg', { responseType: 'blob' })
    .subscribe(blob => {
      const reader = new FileReader();
      const binaryString = reader.readAsDataURL(blob);
      reader.onload = (event: any) => {
        console.log('Image in Base64: ', event.target.result);
        this.image=event.target.result;
        jQuery("#printModal").modal('show');
      };
     
    //  jQuery('#printModal').model('show');
    });
  }

  getUserName() {
    if (this.authdata.isAuth) {
      return this.authService.authData.firstName + ' ' + this.authService.authData.lastName;
    }
    else {
      return '';
    }

  }

  hideSideMenu() {
    if (jQuery('.control-sidebar').hasClass('control-sidebar-open')) {
      jQuery('.control-sidebar').removeClass('control-sidebar-open');
    }
  }

  openSideMenu() {
    if (jQuery('.control-sidebar').hasClass('control-sidebar-open')) {
      jQuery('.control-sidebar').removeClass('control-sidebar-open');
    }
    else {
      jQuery('.control-sidebar').addClass('control-sidebar-open');
    }
  }
  hideMenu(url) {
    this.router.navigate([url]);
    jQuery('.dropdown-content').addClass('menushowhide');
  }
  showMenu() {
    if (jQuery('.dropdown-content').hasClass('menushowhide')) {
      jQuery('.dropdown-content').removeClass('menushowhide');
    }
  }

  getFormList() {
    if (!this.authdata.isAuth) {
      this.router.navigate(["/login"]);
      // // console.log('getforms');
      // // console.log(this.authService.authData.isAuth);
    }
    else {
      var menulistpush = [];
      let param: string = this.currentUser.profileIDs.join();

      // this.httpService.get(APIURLS.BR_MASTER_PROFILEFORMMAIN_API).then((data: any) => {
        this.httpService.getByParam(APIURLS.BR_MASTER_GETFORMSFROMPROFILES, param).then((data: any) => {
   
          if (data.length > 0) {
          
      
          let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
          this.urlList = data.sort((a:any, b:any) => { return collator.compare(a.subMenuId, b.subMenuId) });
          this.urlList.sort((a:any, b:any) => { return collator.compare(a.menuId, b.menuId)});
          // this.urlList = data.sort((a:any, b:any) => { return (+a.subMenuId - +b.subMenuId) });
          // this.urlList.sort((a:any, b:any) => { return (+a.menuId - +b.menuId) });
          // this.urlList.sort((a, b) => a.id.localeCompare(b.id));
          //this.urlList.sort((a, b) => +a.menuId !== +b.menuId ? +a.menuId < +b.menuId ? -1 : 1 : 0);
          //this.urlList.sort((a, b) => +a.subMenuId !== +b.subMenuId ? +a.subMenuId < +b.subMenuId ? -1 : 1 : 0);
          // // console.log(this.urlList);
          localStorage.setItem('formUrlList', JSON.stringify(this.urlList));
          var uniqueMenuIdGroupBy = _.uniqBy(data, 'menuId');
          this.menuListData = [];
          for (var i = 0; i < uniqueMenuIdGroupBy.length; i++) {
            this.menuListData.push({ Parent: uniqueMenuIdGroupBy[i], Children: [_.filter(data, function (obj) { if (obj.menuId == uniqueMenuIdGroupBy[i].menuId) return obj.menuId; })] });
          }
          // this.menuListData.sort(s=> s.subMenuId);
          // // console.log(this.menuListData);
          this.settingsMenuList = _.filter(this.menuListData, function (setObj) { if (setObj.Parent.moduleName == 'Settings') return setObj; });
          this.menuListData = _.filter(this.menuListData, function (setObj) { if (setObj.Parent.moduleName != 'Settings') return setObj; });
          this.menuListData = _.filter(this.menuListData, function (setObj) { if (!(setObj.Parent.moduleName.includes('Print Layout'))) return setObj; });
          this.uimgList = this.authdata.imgurl;
          // // console.log('this.settingsMenuList');
          // // console.log(this.settingsMenuList);
          this.updateMenuCounts();
        }
      }).catch((error)=> {
        this.urlList = [];
      });
    }
  }

  getUserImg() {
    if (!this.authdata.isAuth) {
      this.router.navigate(["/login"]);
      // // console.log('getforms');
      // // console.log(this.authService.authData.isAuth);
    }
    else {
      this.httpService.get(APIURLS.BR_MASTER_USRIMG_API).then((data: any) => {

        //   this.usrList = data;
        //   this.uimgList = _.filter(this.usrList, function (obj) {obj.img_Url == null || obj.img_Url == ""? '../assets/dist/img/profile_small.jpg':  obj.img_Url; });
        //   // // console.log("userimage:"+this.uimgList);
        //   this.uimgList = data.imgUrl == null || data.imgUrl == ""? '../assets/dist/img/profile_small.jpg':data.imgUrl;
        this.cmpimg = data.cImg == null || data.cImg == "" ? '../assets/dist/img/micrologo.png' : data.cImg;
        this.cmp_name = "Micro Labs";


      }).catch((error) => {
        this.uimgList = '';
      });
    }
  }

  onLogout()
  {
   // this.http.get("http://api.ipify.org/?format=json").subscribe((res:any)=>{
      //console.log(data);
      //this.ipAddress=res.ip;
      var filterModel:any={};
      filterModel.employeeId=this.authdata.employeeId;
      filterModel.application='UNNATI';
      filterModel.activity='LOGOUT';
     // filterModel.ipAddress=res.ip;

      this.httpService.post(APIURLS.BR_UPDATE_USER_LOG,filterModel).then((data)=>{
        if(data.length>0)
        {

        }

        this.authService.logout();
        localStorage.removeItem('formUrlList');
        localStorage.setItem('formUrlList', JSON.stringify(""));
        localStorage.clear();
        this.router.navigate(["/login"]);
      }).catch((error)=>{

      });
   // });
    
  }

  getMsgBoardMasterList() {
    if (!this.authdata.isAuth) {
      this.router.navigate(["/login"]);
      // // console.log('getforms');
      // // console.log(this.authService.authData.isAuth);
    }
    else {
      this.httpService.get(APIURLS.BR_MASTER_DISPLAYMSGBOARD__GETALLDATA_API).then((data: any) => {
        if (data.length > 0) {
          this.messageBoardList = data;
          // this.messageBoardList = this.messageBoardList.filter(s=>s.IsActive !=false)

        }
      }).catch((error)=> {
        this.messageBoardList = [];
      });
    }
  }
  routetoUrl(url: string) {
    let routeUrl: string = '';
    if (url != "") {
      if (!/^http[s]?:\/\//.test(url)) {
        routeUrl = 'http://';
      }
      routeUrl = routeUrl + url;
      window.open(routeUrl, '_blank');
      //window.location.href = routeUrl;
    }
    else {
      window.open(routeUrl, '_blank');
    }
  }

  validateUrlBasedAccess(path: string) {
    if (this.urlList == undefined) {
      var chkaccesslist = JSON.parse(localStorage.getItem('formUrlList'));
      this.urlAccess = _.filter(chkaccesslist, function (obj) { if (_.includes(path, obj.url)) return obj; });
      if (this.urlAccess.length > 0) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      this.urlAccess = _.filter(this.urlList, function (obj) { if (obj.url == path) return obj; });
      if (this.urlAccess.length > 0) {
        return true;
      }
      else {
        return false;
      }
    }
  }
  validateUrlAccess(subMenu: string) {
    this.urlAccess = _.filter(this.urlList, function (obj) { if (obj.subMenuId == subMenu) return obj; });//this.appService.urlList.find((s:any) => s.name == "Entity");

    if (this.urlAccess.length > 0) {

      return true;
    }
    else {
      return false;
    }
  }
  validateDashboardAccess(menu: string) {
    this.urlAccess = _.filter(this.urlList, function (obj) { if (obj.menuId == menu) return obj; });

    if (this.urlAccess.length > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  validateApprovalUrlAccess(menu: string, subMenu: string) {
    this.urlAccess = _.filter(this.urlList, function (obj) { if (obj.menuId == menu && obj.subMenuId == subMenu) return obj; });//this.appService.urlList.find((s:any) => s.name == "Entity");
    if (this.urlAccess.length > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  plant!: string
  getLocationById(lId: number) {
    this.httpService.getById(APIURLS.BR_MASTER_LOCATION_MASTER_API, lId).then((data: any) => {
      if (data) {
        this.plant = data.code;
      }
      if(this.authService.authData.passwordExpired)
      {
        swal({
          title: "Your password has been expired. Please change your password.",
          icon: "warning",
          buttons: [false, true],
        })
          .then((willsave) => {
            if (willsave) {
                this.router.navigate(['/changepassword']);
            }
          });
      }
    }).catch((error)=> {
      this.plant = '';
    });
  }
  goToMenuItem(url, i, j) {
    this.router.navigate([url]);
    jQuery(".sideMenuItem").removeClass('active');
    jQuery("#sideMenuItem_"+i+"_"+j).addClass('active');
    //jQuery('.dropdown-content').addClass('menushowhide');
  }

  totalPendingTasks = 0;
  flowLinks: any[] = [
    {type:"Offer Approval", link:"HR/offer/pending-tasks", menu:"Pending Recruitment"},
    {type:"Offer Exception Approval", link:"HR/offer/pending-tasks", menu:"Pending Recruitment"},
    {type:"Appointment Approval", link:"HR/offer/pending-tasks", menu:"Pending Recruitment"},
    {type:"Appointment Verification", link:"HR/offer/pending-tasks", menu:"Pending Recruitment"},
    {type:"Appraisal Approval", link:"HR/actions/pending-appraisals", menu:"Pending Appraisals"},
    {type:"Appraisal Recommendation", link:"HR/actions/appraisal-review", menu:"Appraisals Recommendation"},
    {type:"Confirmation Approval", link:"HR/confirmation/pending-tasks", menu:"Pending Confirmations"},
    {type:"Confirmation Recommendation", link:"/HR/ess/confirmation/list", menu:"Confirmation Recommendation"},
    {type:"FNF Approval", link:"HR/fnf/pending-fnf-list", menu:"Pending FnF List"},
    {type:"Resignation Approval", link:"HR/separation/pending-resignation", menu:"Pending Resignations"},
    {type:"Retirement Approval", link:"HR/retirement/pending-extension-list", menu:"Pending Retirements"},
    {type:"Recall Approval", link:"HR/recall/pending-recall", menu:"Pending Recall"},
    {type:"Service Withdrawn Approval", link:"HR/termination/pending-termination-list", menu:"Pending Recommendation"},
    {type:"Transfer Approval", link:"HR/transfer/pending-list", menu:"Pending Transfers"},
    {type:"Employee Profile", link:"HR/ess/pending-employee-profile-list", menu:"Pending Profile Updates"},
    {type:"UserIdRequest", link:"userIdRequest", menu:""},
    {type:"Termination Approval", link:"HR/termination/pending-termination-list", menu:"Pending Terminations"}
  ];
  getPendingTasksSummary() {
    if (!this.authdata.isAuth) {
      this.router.navigate(["/login"]);
    }
    else {
     
      this.httpService.HRget(APIURLS.HR_EMPLOYEE_GET_PENDING_TASKS_SUMMARY+"/"+this.authdata.uid).then((data: any) => {
        if (data.length > 0) {
          this.tasksList = data;
          this.totalPendingTasks = 0;
          data.forEach(t => {
            this.totalPendingTasks += t.count;
             var flow = this.flowLinks.find(x=>x.type == t.flowType);
             if(flow != null){
              t.link = flow.link;
              t.type = flow.type;
            }
          });
          this.updateMenuCounts();
        }
      }).catch((error)=> {
        this.tasksList = [];
      });
    }
  }
  PendingCount: any = 0;
  isLoading:boolean=false;
  
  updateMenuCounts(){
    var totalPendingTasks = 0;

    if(this.tasksList != null && this.tasksList.length > 0){
      this.tasksList.forEach(t => {
        totalPendingTasks += t.count;
        var flow = this.flowLinks.find(x=>x.type == t.flowType);
        if(flow != null){
          // add counts on each menu item for pending approval menu items
          if(this.menuListData != null && this.menuListData.length > 0){
            let essMenu = this.menuListData.find(x=>x.Parent.moduleName == "ESS");
            if(essMenu != null && essMenu.Children != null && essMenu.Children.length > 0 && essMenu.Children[0] != null && essMenu.Children[0].length > 0){
              var menuItem = essMenu.Children[0].find((x:any) => x.name == flow.menu);
              if(menuItem != null){
                if(menuItem.count == null)
                  menuItem.count = 0;
                menuItem.count += t.count;
              }
            }
          }
        }            
      });
      
      if(this.menuListData != null && this.menuListData.length > 0){
        let essMenu = this.menuListData.find(x=>x.Parent.moduleName == "ESS");
        essMenu.Parent.totalCount = totalPendingTasks;
      }
    }
  }
  getUIDcount() {
    this.isLoading = true;
    try {
     
      var filterModel: any = {};
      filterModel.status = "Pending";
      filterModel.creator = this.currentUser.employeeId;
      filterModel.export = true;
      this.httpService.post(APIURLS.BR_USERID_REQUESTS_FILTER_API, filterModel).then((data: any) => {
        if (data.length>0) {

          this.totalPendingTasks += data.length;          
          let links:any={};
          links.link ="userIdRequest";
          links.type ="UserIdRequest";
          links.count = data.length;
          this.tasksList.push(links);
          
        }
        this.getPendingcount();
        //  this.reInitDatatable();
        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;

      });


    }
    catch (error) {
      this.isLoading = false;
      alert(error);
    }

  }

  getPendingcount()
  {
    this.httpService.getByParam(APIURLS.GET_PENDING_COUNT,this.currentUser.employeeId).then((data)=>{
      if(data.result.length>0)
      {
        let res=data.result;
        res.forEach((element:any)=> {

          let links:any={};
          this.totalPendingTasks += element.count;
          links.link =element.link;
          links.type =element.type;
          links.count=element.count;
          this.tasksList.push(links);
        });
       
      }
    }).catch((error)=>{
      this.isLoading=false;
    })
  }

  announcement: any = {};
  viewAnnouncementDetails(item){
    this.announcement=item;
    $("#announcementModal").modal("show");
  }
}
