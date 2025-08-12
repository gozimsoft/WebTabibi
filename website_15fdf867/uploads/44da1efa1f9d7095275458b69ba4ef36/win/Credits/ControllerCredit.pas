
unit ControllerCredit ;
interface
uses   FireDAC.Comp.Client,  FireDAC.Stan.Param, System.SysUtils
,System.Classes, System.Variants,   json, Data.DB
 ,System.UITypes , DBAccess,
  Uni, UniProvider, SQLiteUniProvider;

type
TCredit = class
private
       FID : String;
FClient_id : String;
FPrice :Double ;

       
public
        constructor Create( aID : String ) ;
        destructor Destroy; override;
         property ID : String read FID write  FID ;
 property Client_id : String read FClient_id write  FClient_id ;
 property Price : Double read FPrice write  FPrice ;

        function Save: Boolean;
        function Delete: Boolean;

        class function GetCredit( aValue:integer ): TCredit;
        class function GetCount : integer ;
        class function First: TCredit ;
        class function Last: TCredit ;
        class function Credits: Tstrings ;


end;

implementation
uses
DMUnit ;
{ TCredit  }
{$WARN IMPLICIT_STRING_CAST OFF}
{$WARN IMPLICIT_STRING_CAST_LOSS OFF}

constructor TCredit.Create(aID : String);
var
        Qry: TUniQuery;
begin
        
        Price := 0;

        if aID = EmptyStr then
           Exit;
        Qry :=  DM.NewQuery;
        try
                Qry.SQL.Text :=
                ' select * from  Credits '
                +' where ID = :ID  ';
                Qry.ParamByName('ID').Value := aID;
                Qry.Open();
                FID := Qry.FieldByName('ID').AsString ;
FClient_id := Qry.FieldByName('Client_id').AsString ;
FPrice := Qry.FieldByName('Price').AsFloat ;

        finally
                Qry.Free;
        end;
end;
function TCredit.delete:Boolean;
var
        Qry: TUniQuery;
begin
        Result := False;
        if FID  = EmptyStr then
          Exit;
        Qry := dm.NewQuery;
        try
                Qry.SQL.Text :=
                ' Delete from  Credits '
                + ' where ID = :ID ' ;
                Qry.ParamByName('ID').Value := FID ;
                Qry.ExecSQL;
                Result := True;
        finally
                Qry.Free;
        end;
end;

function TCredit.Save: Boolean;
var
        Qry: TUniQuery;
begin
        if FID = EmptyStr then
           FID :=  DM.GS.NewGuid ;
        Qry := DM.NewQuery;
        try
                Qry.SQL.Text :=
                ' select * from  Credits '
                +' where ID= :ID ';
                Qry.ParamByName('ID').Value := FID;
                Qry.Open();
                if Qry.RecordCount > 0 then
                        Qry.Edit
                else
                        Qry.Insert;
                 Qry.FieldByName('ID').AsString  := FID ;
 Qry.FieldByName('Client_id').AsString  := FClient_id ;
 Qry.FieldByName('Price').AsFloat  := FPrice ;

                Qry.Post;
                
                Result := True;
        finally
                Qry.Free;
        end;
end;

class function  TCredit.GetCount : integer;
var
  Qry: TUniQuery;
begin
  Qry := DM.NewQuery;
  try
    Qry.SQL.Text := ' select count(*) as c from   Credits ';
    Qry.Open();
    if Qry['c'] <> NULL then
      Result := Qry['c']
    else
      Result := 0;
  finally
    Qry.Free;
  end;

end;


class function  TCredit.first: TCredit;
begin
        Result := TCredit.GetCredit( 0 );
end;

class function  TCredit.last: TCredit;
begin
        Result := TCredit.GetCredit( 1 );
end;

class function  TCredit.GetCredit( aValue:integer ): TCredit;
var
  Qry: TUniQuery;
begin

  Qry := DM.NewQuery;
  try
    Qry.SQL.Text := ' select ID from Credits ';
    Qry.Open();
    if aValue = 0 then
        Qry.first
    else
        Qry.last ;
    Result :=  TCredit.Create(Qry.FieldByName('ID').Asstring);
  finally
    Qry.Free;
  end;

end;

class function  TCredit.Credits : TStrings ;
var
  Qry: TUniQuery;
  Credit: TCredit;
begin
  Result := TStringList.Create;
  Qry := DM.NewQuery;
  try
    Qry.SQL.Text := ' select ID from  Credits ';
    Qry.Open();
    while not Qry.Eof do
    begin
      Credit := TCredit.Create(Qry['ID']);
      Result.AddObject(Credit.ID, Credit);
      Qry.Next;
    end;
  finally
    Qry.Free;
  end;
end;





destructor TCredit.Destroy;
begin
 
  inherited;
end;

end.
