import { Component, OnInit } from '@angular/core';
import { Lightbox } from 'ngx-lightbox';
import { AuthData } from '../auth/auth.model';
import { AppComponent } from '../app.component';
import { HttpService } from '../shared/http-service';
import { Router } from '@angular/router';
import { APIURLS } from '../shared/api-url';
import { RequestOptions, Headers } from '@angular/http';
declare var jQuery: any;
declare var $: any;
@Component({
  selector: 'app-pageboard',
  templateUrl: './pageboard.component.html',
  styleUrls: ['./pageboard.component.css']
})
export class PageboardComponent implements OnInit {
  _albums = [];
  j = 1;
  empData: AuthData;
  roleId: number;
  usrid: number;
  errMsg: string;
  isLoading: boolean;
  EmployeeList1: any;
  location: any;

  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router, private _lightbox: Lightbox) {
    // this.j = (this.j%3==0)?this.j++:this.j%3;
    // const src = 'https://mdbootstrap.com/img/Photos/Horizontal/Nature/4-col/img%20(10' + i + ').jpg';
    // const caption = 'Image ' + i + ' caption here';
    // const thumb = 'https://mdbootstrap.com/img/Photos/Horizontal/Nature/4-col/img%20(10' + i + ').jpg';
    for (let i = 1; i <= 4; i++) {
      const src = 'assets/dist/img/img/image' + i + '.jpg';
      const caption = 'Image ' + i + ' caption here';
      const thumb = 'assets/dist/img/img/image' + i + '-thumb.jpg';
      const album = {
        src: src,
        caption: caption,
        thumb: thumb
      };

      this._albums.push(album);
      this.j++;
    }
  }
  open(index: number): void {
    // open lightbox
    // console.log(index);
    this._lightbox.open(this._albums, index);
  }

  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }
  ngOnInit() {
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'));
    // console.log('Pageboad:'); 
    // console.log(authData);
    this.roleId = authData.roleId;
    this.usrid = authData.uid;
    this.empData = authData;
    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload')
      location.reload()
    } else {
      localStorage.removeItem('foo')
    }
    // this.getEmployee();
    if (this.roleId == 4)
      this.router.navigateByUrl('/welcome-page');
  }

  ngAfterViewInit() {
    $('#carousel-example-generic').carousel();
  }
  // getEmployee(){
  //   this.errMsg = "";
  // this.isLoading = true;
  // this.httpService.getById(APIURLS.BR_EMPLOYEEMASTER_API_GET, this.usrid).then((data: any) => {
  //     this.isLoading = false;
  //     if (data.length > 0) {
  //         this.EmployeeList1 = data;
  //         this.location = this.EmployeeList1.baseLocation;
  //         // this.reInitDatatable();
  //         // this.generateChart();
  //         // this.getLocwiseList();
  //     }
  // }).catch(error => {
  //     this.isLoading = false;
  //     this.EmployeeList1 = [];
  // });

  // }
  getHeader(): any {
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let authData: AuthData = JSON.parse(localStorage.getItem('currentUser'))
    headers.append("Authorization", "Bearer " + authData.token);
    let options = new RequestOptions({ headers: headers });
    return options;
  }
}
