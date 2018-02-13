# Annotation Access Permissions

## Permission Requirements

### Levels of permissions

From discussions with potential users it is clear there is a need to have different levels of permissions, with the default being *private*, that is, only the creator of an annotation can see/edit/delete the annotation. Further levels can be *group* and *public*. A flexible solution for dealing with groups is the UNIX model, where users represent their own groups, but additional groups can be made to which multiple users can belong.

### Transferring permissions

Each annotation must have see/edit/delete permissions for at least one user (typically the creator), but there may be a need to transfer permissions to another user. It may also be desirable to transfer full permissions to a group of users.

### Operations permitted

The most basic permission is being able to read/see/view an annotation. Given that a user can create, retrieve, edit, and remove annotations, it makes sense to have separate permissions for different *operations*, e.g. seeing (reading) and changing or removing (writing). This can also be based on the UNIX model for read/write/execute permissions. The *execute* operation in UNIX has no meaningful correspondence in the annotation domain, so it can be discarded.

This results in the following list of requirements:

+ R1: there should be permission levels for owner, group and public.
+ R2: the operation types reading and writing should have their own permissions.
+ R3: ownership should be transferrable.
+ R4: owners should be able to change operation permissions per level and per group.

## Permission model

Types of permissions:

+ **owner**: the user who is the owner of the annotation. By default, this is the creator of the annotation, but it should be possible to transfer ownership to other users or groups of users. The owner can only be a single entity, e.g. either a single user or a single group.
+ **group**: the group(s) who have access to the annotation. Each user represents their own group. Additional groups can be made that can have multiple members. Users may want to share an annotation with multiple users and/or multi-user groups, so this can be a list of groups (single-user and multi-user groups).
+ **public**: the public represents any user. The server may return *public* annotations for requests without an authenticated user.

The owner of an annotation can have (What?)

Types of operations permitted:

+ **read**: the permission to see/view/read an annotation. The responsibility lies with the server to return only annotations to a user who has read permissions.
+ **writing**: the permission to make changes to an annotation, including deleting it. Changes are timestamped via the `modified` property. To avoid overly complex permission models, there should only be a single set of properties that are allowed to be changed. The properties relation to the creation of the annotation (e.g. `creator`, `created`) should not be changeable. The server should check with each PUT request whether the user has edit permissions. The client can indicate edit permissions through e.g. an edit button. 

There are some issues regarding *changing* or *deleting* annotations. If an annotation is the target of a later annotation, it cannot be changed or removed without consequences. One way of dealing with this is to add a notification to annotations that target a changed/deleted annotation. Another way is to not allow changing/removing annotations that are targets of other annotations. 

[BB: In Alexandria, there is no "editing" of an annotation as such, when you PUT to an existing annotation, this creates a new annotation that replaces the existing annotation, and increases the "version" number. When referring to the annotation by URI, it always refers to the latest version of the annotation, but all versions of the annotation can be retrieved by adding /ver/ + the version number to the annotation URI. Also, sending a DELETE to an annotation sets the state of that annotation to DELETED. DELETED annotations are hidden by default, but can still be retrieved. ( http://huygensing.github.io/alexandria/alexandria-acceptance-tests/concordion/nl/knaw/huygens/alexandria/annotation/Accessing.html )
This can be an alternative or an additional way of dealing with edit/delete.

There is also currently no provision in Alexandria for user-based access limitations, or grouping of users.]

### Capturing groups and permissions in annotations

The W3C working group for Web Annotations suggests to use the [audience](https://www.w3.org/TR/annotation-model/#intended-audience) property for any *group*-related aspects and that *authorization* and *authentication* are not responsibilities of the annotation data model (as discussed in this issue on GitHub: [How do we model "groups" in the Annotation Model](https://github.com/w3c/web-annotation/issues/119)). 

Authentication is dealt with by the annotation server. The annotation protocol can deal with authorization through URL query parameters.

Access permission parameters:

+ `can_see`: list of users who can see but not edit an annotation
+ `can_edit`: list of users who can see *and* edit an annotation

Access status parameter:

+ `access_status`: determines whether an annotation is `private`, `shared` or `public`. An owner/creator can always change the status of `private` and `shared` annotations. *Question*: should an owner/creator be able to change the status of `public` annotations back to `shared` or `private`?
+ When `POST`ing an annotation, a creator can indicate the `access_status` of the annotation, and where relevant, the access permission parameters.
    + The default `access_status` is `private`. An annotation `POST`ed without specifying its `access_status` is assumed to be private. For `private` annotations, no additional permission parameters are required or allowed. Owners/creators can always see and edit their own annotations.
    + For `shared` annotations, the owner/creator MAY indicate who `can_see` and who `can_edit`. If no permissions are specified, no changes in permissions are made (e.g. if user `POSTS` a new annotation are `shared` or changes an existing annotation from `private` to `shared` without listing other users, the status is set to `shared` but only the user has access. Owners/creators do not have to list themselves in the `shared` permission lists, as they always retain `can_see` and `can_edit` permissions.
    + For `public` annotations, only the owner/creator has permissions to change or delete the annotation. *Question*: should `public` annotations be deletable?

```
POST /annotations/?access_status=restricted&can_see=Bob&can_edit=Charlie
Host: {annotation-server-address}
Accept: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
Content-Type: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"

{
    "@context": "http://www.w3.org/ns/anno.jsonld",
    "type": "Annotation",
    "body": [
        {
            "value": "Communication",
            "purpose": "classifying",
            "id": "http://dbpedia.org/resource/Communication"
        }
    ],
    "creator": "Alice",
    "target": [
        {
            "@context": "http://boot.huygens.knaw.nl/annotate/vangoghontology.ttl#",
            "type": ["Text", "Letter"],
            "id": "urn:vangogh:let001"
        }
    ]
}
```

In the above annotation, _Alice_ is the owner/creator of the annotation, _Bob_ can only see but not edit the annotation, while _Charlie_ can see and edit the annotation, as well as delete it. Both _Alice_ and _Charlie_ can change who `can_see` and `can_edit` the annotation, although _Charlie_ cannot change or remove the permissions of _Alice_ as she remains the owner/creator of the annotation and does not have to be specified in the parameters.

### Bulk updating permissions

TO DO: finish this section.

A user may want to update a set of annotations to have the same acccess status and permissions. To enable bulk setting or updating of permissions, a user can `PUT` an `AnnotationContainer` using `Prefer` type `PreferContainedIRIs` in the request header, and the access status and permissions in the URL parameters. 

For sharing annotations with large numbers of users, specifying them in the URL is cumbersome. There might be a clean way to add permission information in the container representation.


