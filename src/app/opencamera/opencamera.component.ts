import { Component, OnInit } from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {WebcamImage} from 'ngx-webcam';

@Component({
  selector: 'app-opencamera',
  templateUrl: './opencamera.component.html',
  styleUrls: ['./opencamera.component.css']
})
export class OpencameraComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public webcamImage: WebcamImage = null;

  handleImage(webcamImage: WebcamImage) {
    this.webcamImage = webcamImage;
  }
}
