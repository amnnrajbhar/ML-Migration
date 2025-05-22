import { Component, OnInit } from '@angular/core';

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
