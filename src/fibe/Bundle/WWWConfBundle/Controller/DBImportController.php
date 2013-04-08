<?php 
namespace fibe\Bundle\WWWConfBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use IDCI\Bundle\SimpleScheduleBundle\Entity\Event; 
use IDCI\Bundle\SimpleScheduleBundle\Entity\XProperty; 
use IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntityRelation; 

/**
 * Api controller.
 *
 * @Route("/admin/link/DBimport")
 */
class DBImportController extends Controller
{
/**
 * @Route("", name="wwwconf_admin_DBimport") 
 */
    public function importAction(Request $request)
    {  
        $JSONFile = json_decode($request->request->get('dataArray'),true); 
        $em = $this->getDoctrine()->getManager(); 
        $events = $JSONFile['events'];
        $entity=null;
        $eventEntities= array();
        for($i=0;$i<count($events);$i++){
            $entity= new Event();
            $current = $events[$i]; 
            foreach ($current as $setter => $value) { 
                if($setter=="setStartAt" || $setter=="setEndAt"){
                    $value=new \DateTime(explode(' ', $value)[0], new \DateTimeZone(date_default_timezone_get()));
                }
                //if($setter!="setStartAt" && $setter!="setEndAt")echo "Event->".$setter."(".$value.");\n"; 
                call_user_func_array(array($entity, $setter), array($value)); 
            } 
            $em->persist($entity); 
            array_push($eventEntities,$entity); 
        }
        
        //echo "xproperties->\n";
        $xproperties = $JSONFile['xproperties']; 
        for($i=0;$i<count($xproperties);$i++){
            $current = $xproperties[$i];
            $entity= new XProperty();
            foreach ($current as $setter => $value) { 
                if($setter=="setCalendarEntity"){
                
                    //echo "XProperty->->".$eventEntities[strval($value)]."->".$value.");\n";
                    $value=$eventEntities[$value]; 
                } 
                //echo "XProperty->".$setter."(".$value.");\n";
                call_user_func_array(array($entity, $setter), array($value)); 
            }
            $entity->setXKey(rand (0,9999999999));
            $em->persist($entity);
        }
        
        //echo "relations->\n";
        $relations = $JSONFile['relations'];
        for($i=0;$i<count($relations);$i++){
            $current = $relations[$i];
            $entity= new CalendarEntityRelation();
            foreach ($current as $setter => $value) {
                if($setter=="setCalendarEntity" || $setter=="setRelatedTo"){
                    $value=$eventEntities[$value]; 
                }
                //echo "Relation->".$setter."(".$value.");\n";
                call_user_func_array(array($entity, $setter), array($value)); 
            } 
            $em->persist($entity);
        }
        try{
            $em->flush(); 
            return new Response("ok");
            }
        catch (\Exception $e) {
            return new Response(toString($e)); 
        }

    } 
}

 /** 
  *  
  */ 

/*USEFULL ENTITIES FUNCTION */

    /*EVENT*/
        //setCreatedAt($createdAt) @param: /Datetime 
        //setStartAt($startAt)
        //setSummary($summary)
        //setDescription($description)
        //setOrganizer($organizer)
        //setContacts($contacts)

    /*CalendarEntityRelation*/
        //setRelationType($relationType) {CHILD|SIBLING|PARENT}
        //setCalendarEntity(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $calendarEntity = null)
        //setRelatedTo(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $relatedTo = null)

    /*XPROPERTY*/
        //setCalendarEntity(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $calendarEntity = null)
        //setXNamespace($string); {publication_uri|event_uri}
        //setXKey(rand (0,9999999999));//todo AUTO_INCREMENT ??  
        //setXValue($xValue) uri....

    /* ???????????????????????????????????? */
    /*CATEGORIES*/
        //setName($name)
        //setDescription($description)
        //setLevel($level) int
        //addCalendarEntities(\IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntity $calendarEntities)


    /* ???????????????????????????????????? */

