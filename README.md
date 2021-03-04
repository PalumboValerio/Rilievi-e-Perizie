# Rilievi-e-Perizie

Una certa azienda di assicurazioni ha necessità di archiviare in tempo reale su un server le fotografie di rilievi/perizie eseguite dai propri dipendenti. Insieme ad ogni fotografia occorre salvare:
- Coordinate geografiche del luogo in cui la fotografia è stata scattata
- Data e ora di scatto
- Codice dell’operatore che ha scattato la fotografia
- Note inserite dall’operatore che ha eseguito lo scatto

A tal fine realizzare una apk android che consenta all’operatore di scattare le fotografie ed archiviarle su un server remoto. Le fotografie possono essere uploadate singolarmente oppure a gruppi.
L’operatore, al primo utilizzo, deve registrarsi sul server. In corrispondenza del login viene restituito un token con TTL elevato in modo da non dover rifare il login ogni volta.
Lato server realizzare una o più API nodejs pubblicate su heroku che memorizzano i dati all’interno di un database posizionato su Atlas. Le immagini possono essere salvate all’interno del DB in formato base64 (con impostazione di una dimensione massima) oppure su un file server esterno.

Realizzare infine una applicazione server con target PC desktop in cui un utente ADMIN:
- Può creare gli utenti abilitati allo store delle fotografie. La password iniziale sarà generata casualmente dal server e l’utente dovrà modificarla in corrispondenza del primo accesso
- Può visualizzare su una unica mappa tutte le fotografie scattate dagli operatori. Ogni fotografia sarà caratterizzata da un apposito segnaposto posizionato sul luogo di scatto della fotografia. In corrispondenza del click sul segnaposto verrà visualizzata la foto con tutte le informazioni ad essa associate
- Per ogni immagine l’utente ADMIN può aggiungere o modificare ulteriori considerazioni personali (gestite all’interno di un unico campo per ogni fotografia).
- Infine l’utente ADMIN potrà visualizzare percorso e tempo di percorrenza per il raggiungimento del luogo in cui è stata scattata la fotografia