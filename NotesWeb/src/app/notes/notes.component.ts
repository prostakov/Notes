import { Component, OnInit } from '@angular/core';
import {SlimLoadingBarService} from 'ng2-slim-loading-bar-observables';
import { Note } from '../note';
import { NotesService } from '../notes.service';
import { UUID } from 'angular2-uuid';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent  implements OnInit {
  public notes: Note[];
  public modeEditing: boolean;
  public currentNoteId: string | null;
  public currentNoteText: string;
  public noteAction: string;
  private updatesInProgress: string[];

  public apiUrl: string;

  constructor(private dataService: NotesService,
              private slimLoadingBarService: SlimLoadingBarService) {
      this.notes = [];
      this.modeEditing = false;
      this.currentNoteId = null;
      this.currentNoteText = "";
      this.noteAction = "Create Note";
      this.updatesInProgress = new Array<string>();
      this.apiUrl = '';
  }

  ngOnInit() {
      this.dataService.getNotes()
          .subscribe(
              (data: Note[]) => this.notes = data,
              error => console.log(error)
          );
  }

  private getNote(noteId:String):Note  {
      return this.notes.filter(n => n.id === noteId)[0];
  }

  public edit(note: Note) {
      this.currentNoteId = note.id;
      this.currentNoteText = this.getNote(this.currentNoteId).text;
      this.modeEditing = true;
  }

  public createAction() {
      this.slimLoadingBarService.start();
      var note = {
        id: UUID.UUID(),
        text: this.currentNoteText,
        createdAt: null,
        updatedAt: null
      };
      this.dataService.createOrUpdate(note)
           .subscribe(
               (createdNote: Note) => {
                   this.notes.push(createdNote);
                   this.currentNoteText = "";
               },
               error => console.log(error),
               () => this.slimLoadingBarService.complete()
           );
  }

  public updateAction() {
      this.slimLoadingBarService.start();
      var currentNoteId = this.currentNoteId;
      var currentNoteText = this.currentNoteText;

      var note = this.getNote(this.currentNoteId!);
      var updateModel = {
        id: note.id,
        text: currentNoteText,
        createdAt: null,
        updatedAt: null
      };

      this.dataService.createOrUpdate(updateModel)
          .subscribe(
              (updatedNote: Note) => {
                  this.getNote(currentNoteId!).text = updatedNote.text;
              },
              error => console.log(error),
              () => this.slimLoadingBarService.complete()
          );
  }

  public deleteAction(note: Note) {
      if (confirm("Are you sure you want to remove selected note?")) {
          this.slimLoadingBarService.start();
          this.dataService.delete(note)
              .subscribe(
                  response => this.notes.splice(this.notes.indexOf(note), 1),
                  error => console.log(error),
                  () => this.slimLoadingBarService.complete()
              );
      }
  }

  public discardChanges() {
      this.modeEditing = false;
      this.currentNoteId = null;
      this.currentNoteText = "";
  }

  public isCreateDisabled() {
      return this.currentNoteText.length === 0;
  }

  public isUpdateDisabled() {
      return this.currentNoteId !== null && (
             this.currentNoteText === this.getNote(this.currentNoteId).text);// ||
             //this._updatesInProgress.indexOf(this.currentNoteId) > -1);
  }

  public getTitle(text: string): string {
    var lines = text.match(/[^\r\n]+/g);
    return lines && lines.length > 1 ? lines![0] : text;
  }
}
