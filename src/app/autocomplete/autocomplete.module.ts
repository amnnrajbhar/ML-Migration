import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent } from './autocomplete.component';
import { AutocompleteRoutingModule } from './autocomplete-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AutocompleteRoutingModule
  ],
  declarations: [
    AutocompleteComponent
  ]
})
export class AutocompleteModule { }
