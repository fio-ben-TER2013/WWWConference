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
        for($i=0;$i<count($events);$i++){
            $current = $events[$i];
            $entity= new Event();
            foreach ($current as $setter => $value) {
                echo "Event->".$setter."(".$value.");<br />\n";
                call_user_func_array(array($entity, $setter), array($value)); 
            } 
            $em->persist($entity);
            $events[$i]['entity']=$entity;
        }
        
        $xproperties = $JSONFile['xproperties'];
        for($i=0;$i<count($xproperties);$i++){
            $current = $xproperties[$i];
            $entity= new XProperty();
            foreach ($current as $setter => $value) {
                if($setter=="setCalendarEntity"){
                    $value=$events[$value]['entity'];
                }
                echo "XProperty->".$setter."(".$value.");<br />\n";
                call_user_func_array(array($entity, $setter), array($value)); 
            }
            $entity->setXKey(rand (0,9999999999));
            $em->persist($entity);
        }
        
        $relations = $JSONFile['relations'];
        for($i=0;$i<count($relations);$i++){
            $current = $relations[$i];
            $entity= new CalendarEntityRelation();
            foreach ($current as $setter => $value) {
                if($setter=="setCalendarEntity" || $setter=="setRelatedTo"){
                    $value=$events[$value]['entity'];
                }
                echo "XProperty->".$setter."(".$value.");<br />\n";
                call_user_func_array(array($entity, $setter), array($value)); 
            } 
            $em->persist($entity);
        }

        $em->flush(); 
        // create a JSON-response with a 200 status code
        $response = new Response(json_encode('done'));
        $response->headers->set('Content-Type', 'application/json');
        
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

