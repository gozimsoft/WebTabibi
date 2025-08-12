
 unit Controllers;

interface

uses
  Uni, System.Variants, SysUtils, System.IOUtils,
  System.Classes, Data.DB, UniProvider, MemDS,
  Dialogs, IniFiles, System.Generics.Collections, FireDAC.Comp.Client,
  Data.DBXJSONCommon, JSON, DateUtils, Math, System.Types;

type
  TDBController = class
  private
    FConn: TUniConnection;
  public
    constructor Create(aConn: TUniConnection);
    property Conn: TUniConnection read FConn write FConn;
    procedure LoadTable(aSql: string; aDataSet: TDataSet ;
    aParameter: TArray<string>= []);
    procedure AlertMessage;
  end;

implementation

{ TDBController }
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}

uses DmUnit, Consts;

procedure TDBController.AlertMessage;
begin
  dm.MSGMessage.Show(MSG_NOTIFICTION, MSG_SAVE_DONE);
end;

constructor TDBController.Create(aConn: TUniConnection);
begin
  FConn := aConn;
end;
procedure TDBController.LoadTable(aSql: string; aDataSet: TDataSet;
  aParameter: TArray<string>);
var
  Qry: TUniQuery;
  I, PosEqual: Integer;
  Key, Value: string;
  FieldDef: TFieldDef;
  FieldType: TFieldType;
begin
  Qry := TUniQuery.Create(FConn);
  try
    Qry.Connection := FConn;
    Qry.SQL.Text := aSql;
    for I := Low(aParameter) to High(aParameter) do
    begin
      // Key, Value
      PosEqual := Pos('=', aParameter[I]);
      if PosEqual > 0 then
      begin
        Key := Copy(aParameter[I], 1, PosEqual - 1);
        Value := Copy(aParameter[I], PosEqual + 1, Length(aParameter[I]) -
          PosEqual);
        Qry.ParamByName(Key).Value := Value;
      end;
    end;
    Qry.Open;

     if aDataSet.Fields.Count = 0 then
      with TFDMemTable(aDataSet) do
      begin
        for I := 0 to Qry.FieldDefs.Count - 1 do
        begin
          FieldDef := Qry.FieldDefs[I];
          FieldType := FieldDef.DataType;
          if FieldType = ftWideString then
            FieldType := ftString;
          FieldDefs.Add(FieldDef.Name, FieldType, FieldDef.Size,
            FieldDef.Required);
        end;
        CreateDataSet; 
      end;
 
    aDataSet.ControlsDisabled;
    if aDataSet.Active = False then
      aDataSet.Open;
    with TFDMemTable(aDataSet) do
    begin
      BeginBatch;
      EmptyDataSet;
      EndBatch;
    end;
    TFDMemTable(aDataSet).CopyDataSet(Qry);
    aDataSet.EnableControls;

  finally
    Qry.Free;
  end;

end;
end.
